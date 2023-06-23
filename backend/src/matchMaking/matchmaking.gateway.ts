import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io';
import { Constants } from '../../../shared/constants'

import { JwtService } from '@nestjs/jwt';
import { ConnectionService } from 'src/auth/connection/connection.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';
import { Logger } from '@nestjs/common';
import { parse } from 'cookie'
import exp from 'constants';
import { emit } from 'process';

// Game part imports
import {GameState , PaddleAction , GameActionKind } from '../../../shared/pongTypes' ;
import { makeReducer } from '../../../shared/pongReducer';

@WebSocketGateway({
	cors: {
		origin: Constants.FRONTEND_URL,
		credentials: true
	},
	namespace: 'matchMakingGateway',
})
export class MatchMakingGateway {
	@WebSocketServer()
	server: Server;
	private queues: Map<string, Socket[]> = new Map();

	constructor (
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private userService: UserService
	) { }
	private userFromSocket(socket: Socket, result?: any): Promise<User> | undefined {
		try {
			if (!result) {
				if (!socket.handshake.headers.cookie) {
					Logger.log("Cookie's gone");
					return;
				}
				const auth_cookie = parse(socket.handshake.headers.cookie).Authentication;
				result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET })
			}
			return this.connectionService.get({ id: result.id }, ['user']).then(connection => {
				return connection.user;
			});
		}
		catch (e) {
		}
		return undefined;
	}
	private setStatus(user: User, newStatus: string) {
		user.status = newStatus;
		user.save();
	}
	afterInit(server: Server) {
		Logger.log('waitlist')
	}
	
	handleConnection(client: Socket) {
		Logger.log(`new queue connection ${client.id}`);
		if (!client.handshake.headers.cookie)
		{
			Logger.log('Lost the Cookie');
			return;
		}
		const auth_cookie = parse(client.handshake.headers.cookie).Authentication;
		let result = undefined;
		try {
			result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET });
			if (!result)
			throw new Error('Invalid Token');
		} catch {
			client.disconnect();
			return;
		}
		this.userFromSocket(client, result).then(user => {
			this.setStatus(user, 'in_queue');
		})
	}
	handleDisconnect(client: Socket) {
		this.userFromSocket(client).then(user => {
			if (!user)
			return ;
			this.setStatus(user, 'online');
			console.log(`${user.status}`);
		})
		Logger.log(`disconnected ${client.id}`);
	}
  
  
	@SubscribeMessage('join_room')
	handleJoinRoom(client: Socket, room: string) {
		client.join(room);
		client.emit("joinedRoom", room);

	}
	//-----------gameplay----------------//

	@SubscribeMessage('player_movement')
	handlePlayerMovement(client: Socket, action: string) {

	}
	//-----------------------------------//
	
	@SubscribeMessage('leave_room')
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit("leftRoom", room);
	}

	@SubscribeMessage('join_room')
	private addClientToQueue(client: Socket, queue: string) {
		Logger.log(`joining queue ${queue}`)
		client.join(queue);
		if (!this.queues.has(queue))
			this.queues.set(queue, []);
		this.queues.get(queue).push(client)
		client.emit('joinedRoom');
	}
	
	private removeClientFromQueue(queue: string, client: Socket) {
		const clients  = this.queues.get(queue);
		if (clients) {
			const index = clients.indexOf(client);
			if (index != -1) {
				clients.splice(index, 1);
			}
		}
		client.leave(queue);
	}

	private matchClientsInQueue(queue: string) {
		const clients = this.getClientsInQueue(queue);

		if (clients && clients.length >= 2) {
			const client1 = clients[0];
			const client2 = clients[1];
			//TODO: generate unique room key for each game.
			const gameRoom = 'gameRoom';
			this.moveClientsToRoom(client1, client2, gameRoom);
		}
	}

	private moveClientsToRoom(client1: Socket, client2: Socket, roomkey: string) {
		const currentQueue = this.getClientRoom(client1);
		this.removeClientFromQueue(currentQueue, client1);
		this.removeClientFromQueue(currentQueue, client2);

		client1.join(roomkey);
		client2.join(roomkey);
	}

	private getClientRoom(client: Socket): string {
		for (const [queue, clients] of this.queues) {
			if (clients.includes(client))
				return queue;
		}
		return null;
	}

	private getClientsInQueue(queue: string): Socket[] {
		return this.queues.get(queue) || [];
	}
};

export class GameRoom {
	playerLeft: string;
	playerRight: string;
	playerLeftSocket: Socket;
	playerRightSocket: Socket;
	roomName: string;
	GameState: GameState;

	constructor(player1Id: string, player2Id: string, player1Socket: Socket, player2Socket: Socket) {
		this.playerLeft = player1Id;
		this.playerRight = player2Id;
		this.playerLeftSocket = player1Socket;
		this.playerRightSocket = player2Socket;
	}

	//methods for 1 room
	handlePlayerMovement(socketId: string, movement: PaddleAction) { //need to know which player is moving
	
		// Apply the reducer function to update the game state
		const reducer = makeReducer(socketId);
		const newGameState: GameState = reducer(this.GameState, {
			kind: GameActionKind.overrideState,
			value: this.GameState,
		});
	
		// Update the game state in the room
		this.GameState = newGameState;
		// Broadcast the updated game state to both clients in the room
		this.playerLeftSocket.emit('gameState', this.GameState);
		this.playerRightSocket.emit('gameState', this.GameState);
	}

	handleMessage(socket: Socket, payload: any) {
		// Handle the received message
		const { movement } = payload;
		this.handlePlayerMovement(socket.id, movement); //need to know which player is moving
  }
};