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
import { GameState, PaddleAction, GameActionKind } from '../../../shared/pongTypes';
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
	private clientsInGame: Map<string, GameRoom> = new Map();
	private static roomIndex = 0;

	constructor(
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

	private async statusOnDisconnect(client: Socket) {
		const user = await this.userFromSocket(client);

		if (user.status != 'offline') {
			Logger.log('user is online');
			user.status = 'online';
			user.save();
		}
		else
			Logger.log('user is offline');
	}

	afterInit(server: Server) {
		Logger.log('waitlist')
	}

	handleConnection(client: Socket) {
		if (!client.handshake.headers.cookie) {
			Logger.log('Lost the Cookie');
			return;
		}
		this.isClientInGame(client).then((result: boolean) => {
			if (!result) {
				client.emit('new_connection');
				Logger.log(`new queue connection ${client.id}`);
			} else {
				client.emit('start_game');
			}
		}).catch(e => console.error(e));
	}

	handleDisconnect(client: Socket) {
		const currentQueue = this.getClientQueue(client);
		if (currentQueue) {
			this.removeClientFromQueue(client, currentQueue);
		}
		this.statusOnDisconnect(client);
		Logger.log(`disconnected ${client.id}`);
	}

	//-----------gameplay----------------//

	@SubscribeMessage('new_connection') // "new_connection" event
	async handleNewConnection(client: Socket) {
		const queue = { gamemode: 'solo' };
		Logger.log(`joining queue ${queue.gamemode}`)
		client.join(queue.gamemode);
		if (!this.queues.has(queue.gamemode))
			this.queues.set(queue.gamemode, []);
		this.queues.get(queue.gamemode).push(client)

		await this.setStatus(client, 'in_queue')
		this.matchClientsInQueue(queue.gamemode);
	}


	@SubscribeMessage('playerMovement')
	handlePlayerMovement(client: Socket, action: string) {
		const room = this.clientsInGame.get(client.id);
		if (room) {
			room.handleMessage(client, action);
		}
	}

	@SubscribeMessage('gameOver')
	handleGameOver(client: Socket, payload: any) {
		const room = this.clientsInGame.get(client.id);
		if (room) {
			room.handleGameOver(client, payload);
			//unfinished
		}
	}
	//-----------------------------------//

	@SubscribeMessage('join_queue')
	async addClientToQueue(client: Socket, queue: { gamemode: string }) {
		Logger.log(`joining queue ${queue.gamemode}`)
		client.join(queue.gamemode);

		//adding solo mode
		if (queue.gamemode == 'solo') {
			const user = await this.userFromSocket(client);
			const gameRoom = new GameRoom(user.id, null, client, null);
			this.rooms.set(user.id, gameRoom);
			this.clientsInGame.set(user.id, gameRoom);
			this.setStatus(client, 'ingame');
			this.server.to(user.id).emit('start_game');
			return;
		}

		if (!this.queues.has(queue.gamemode))
			this.queues.set(queue.gamemode, []);
		this.queues.get(queue.gamemode).push(client)

		await this.setStatus(client, 'in_queue')
		this.matchClientsInQueue(queue.gamemode);
	}

	private removeClientFromQueue(client: Socket, queue: string) {
		const clients = this.queues.get(queue);
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

		Logger.log(`moving to ${roomkey}`)
		if (!this.rooms.has(roomkey)) {
			const user1id = (await this.userFromSocket(client1)).id;
			const user2id = (await this.userFromSocket(client2)).id;
			const newGame = new GameRoom(user1id, user2id, client1, client2);

			const currentQueue = this.getClientQueue(client1);
			this.removeClientFromQueue(client1, currentQueue);
			this.removeClientFromQueue(client2, currentQueue);

			this.rooms.set(roomkey, newGame);
			this.rooms.get(roomkey).roomName = roomkey;

			client1.join(roomkey);
			this.clientsInGame.set(user1id, newGame);
			this.setStatus(client1, 'ingame')

			client2.join(roomkey);
			this.clientsInGame.set(user1id, newGame);
			this.setStatus(client2, 'ingame')

			this.server.to(roomkey).emit('start_game');
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

	private async isClientInGame(client: Socket): Promise<boolean> {
		const userId = (await this.userFromSocket(client)).id;
		const userGame = this.clientsInGame.get(userId);

		Logger.log('Check for reconnecting client');
		if (userGame != undefined) {
			Logger.log('The client is reconnecting');
			client.join(userGame.roomName);
			if (userId == userGame.playerLeft)
				userGame.playerLeftSocket = client;
			else
				userGame.playerRightSocket = client;
			this.setStatus(client, 'ingame');
			return true;
		}
		Logger.log('The client is connecting fresh');
		return false;
	}
};

export class GameRoom {
	playerLeft: string;
	playerRight: string;
	playerLeftSocket: Socket;
	playerRightSocket: Socket;
	roomName: string;
	GameState: GameState;
	singlemode: boolean; //true for 1v1, false for 2v2

	constructor(player1Id: string, player2Id: string, player1Socket: Socket, player2Socket: Socket) {
		this.playerLeft = player1Id;
		this.playerRight = player2Id;
		this.playerLeftSocket = player1Socket;
		this.playerRightSocket = player2Socket;
		if (player2Id == null) //gamemode == single if userID2 = null
			this.singlemode = true;
		else
			this.singlemode = false;
		this.GameState = {} as GameState;
		this.initiateGame();
	}

	initiateGame() {
		this.GameState = {
			leftPaddle: {
				playerID: this.playerLeft,
				paddlePosition: 0.5,
				action: PaddleAction.None,
				score: 0,
				moved: false,
			},
			rightPaddle: {
				playerID: this.playerRight,
				paddlePosition: 0.5,
				action: PaddleAction.None,
				score: 0,
				moved: false,
			},
			ball: {
				velocity: { x: 0, y: 0 },
				position: { x: 0.5, y: 0.5 },
			},
			time: 0,
			gameOver: false,
			winner: '',
			singlemode: this.singlemode,
		}
	};

	handleMessage(socket: Socket, payload: any) {
		const { movement } = payload;

		let currentPlayer: string;
		if (socket === this.playerLeftSocket) {
			currentPlayer = this.playerLeft;
		} else if (socket === this.playerRightSocket) {
			currentPlayer = this.playerRight;
		} else {
			//socket doesn't belong to players - possible?
			return;
		}

		// Apply the reducer function to update the game state
		const reducer = makeReducer(currentPlayer);
		const newGameState: GameState = reducer(this.GameState, {
			kind: GameActionKind.overrideState,
			value: this.GameState,
		});

		// Update the game state in the room
		this.GameState = newGameState;

		// Broadcast the updated game state to both clients in the room
		if (this.singlemode) {
			this.playerLeftSocket.emit('gameState', this.GameState);
		} else {
			this.playerLeftSocket.emit('gameState', this.GameState);
			this.playerRightSocket.emit('gameState', this.GameState);
		}
	}

	handleGameOver(socket: Socket, payload: any) {

		this.GameState.gameOver = true;
		this.GameState.winner = payload.winner;
	};
};