import {
	MessageBody,
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
	private rooms: Map<string, GameRoom> = new Map();
	private static roomIndex = 0;

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

	private async setStatus(client: Socket, newStatus: string) {
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
		const user = await this.userFromSocket(client, result)
		user.status = newStatus;
		user.save();
		Logger.log(`${user.userName} status: ${user.status}`);
	}

	afterInit(server: Server) {
		Logger.log('waitlist')
	}
	
	handleConnection(client: Socket) {
		if (!client.handshake.headers.cookie)
		{
			Logger.log('Lost the Cookie');
			return;
		}
		Logger.log(`new queue connection ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		const currentQueue = this.getClientQueue(client);
		if (currentQueue) {
			this.removeClientFromQueue(currentQueue, client);
		}
		this.setStatus(client, 'online');
		Logger.log(`disconnected ${client.id}`);
	}
  
	//-----------gameplay----------------//

	@SubscribeMessage('player_movement')
	handlePlayerMovement(client: Socket, action: string) {

	}
	//-----------------------------------//

	@SubscribeMessage('join_queue')
	async addClientToQueue(client: Socket, queue: string) {
		Logger.log(`joining queue ${queue}`)
		client.join(queue);
		if (!this.queues.has(queue))
			this.queues.set(queue, []);
		this.queues.get(queue).push(client)

		await this.setStatus(client, 'in_queue')
		this.matchClientsInQueue(queue);
	}
	
	private removeClientFromQueue(queue: string, client: Socket) {
		const clients  = this.queues.get(queue);
		if (clients) {
			const index = clients.indexOf(client);
			Logger.log(`client index to remove: ${index}`);
			if (index != -1)
				clients.splice(index, 1);
			Logger.log(`queue length after removal: ${this.queues.get(queue).length}`)
		}
		client.leave(queue);
		Logger.log('removed client from queue');
	}

	private matchClientsInQueue(queue: string) {
		const clients = this.getClientsInQueue(queue);

		Logger.log('Check for matches');

		if (clients && clients.length >= 2) {
			const client1 = clients[0];
			const client2 = clients[1];
			const gameRoom = `${queue}-${MatchMakingGateway.roomIndex}`;
			if (MatchMakingGateway.roomIndex < Number.MAX_SAFE_INTEGER)
				MatchMakingGateway.roomIndex++;
			else
				MatchMakingGateway.roomIndex = 0;
			this.moveClientsToRoom(client1, client2, gameRoom);
		}
	}

	private async moveClientsToRoom(client1: Socket, client2: Socket, roomkey: string) {
		
		console.log(`moving to ${roomkey}`);
		if (!this.rooms.has(roomkey))
		{
			const user1id = (await this.userFromSocket(client1)).id;
			const user2id = (await this.userFromSocket(client2)).id;
			const newGame = new GameRoom(user1id, user2id, client1, client2);
		
			const currentQueue = this.getClientQueue(client1);
			Logger.log(`queue length before removal: ${currentQueue.length}`);
			this.removeClientFromQueue(currentQueue, client1);
			this.removeClientFromQueue(currentQueue, client2);

			this.rooms.set(roomkey, newGame);
			this.rooms.get(roomkey).roomName = roomkey;
			client1.join(roomkey);
			this.setStatus(client1, 'ingame')
			client2.join(roomkey);
			this.setStatus(client2, 'ingame')
		}
	}

	private getClientQueue(client: Socket): string {
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