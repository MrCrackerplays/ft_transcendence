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
import { User, UserStatus } from 'src/users/user.entity';
import { Logger } from '@nestjs/common';
import { parse } from 'cookie'
import exp from 'constants';
import { emit } from 'process';

// Game part imports
import { GameState, PaddleAction, GameActionKind, GameMode } from '../../../shared/pongTypes';
import { makeReducer } from '../../../shared/pongReducer';
import { pongConstants } from '../../../shared/pongTypes';
import { GameRoom } from './gameRoom';
import { Cron } from '@nestjs/schedule';
import { EventEmitter } from 'events';


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
	private queuesByGameMode: Map<GameMode, Socket[]> = new Map();
	private roomsByKey: Map<string, GameRoom> = new Map();
	private clientsInGameByUserID: Map<string, GameRoom> = new Map();
	private roomIndex = 0;
	private readonly eventEmitter: EventEmitter = new EventEmitter();

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

	private async setStatus(client: Socket, newStatus: UserStatus) {
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
			Logger.log('user is idle');
			user.status = UserStatus.IDLE;
			user.save();
		}
		else
			Logger.log('user is offline');
	}

	afterInit(server: Server) {
		Logger.log('waitlist');
		this.server = server;
		this.startRoomUpdates();
	}

	handleConnection(client: Socket) {
		if (!client.handshake.headers.cookie) {
			return;
		}
		this.isClientInGame(client).then((isClientInGame: boolean) => {

			if (isClientInGame) {
				client.emit('start_game');
			} else {
				Logger.log('batman emit new_connection');
				client.emit('new_connection');
				Logger.log(`new queue connection ${client.id}`);
			}
		}).catch(e => console.error(e));
	}

	handleDisconnect(client: Socket) {
		Logger.log(`disconnected ${client.id}`);
		const gamemode = this.getGameModeForClient(client);
		if (gamemode) {
			this.removeClientFromQueue(client, gamemode);
		}
		this.statusOnDisconnect(client);
		Logger.log(`disconnected ${client.id}`);
	}

	//-----------gameplay----------------//

	@SubscribeMessage('new_connection') // "new_connection" event
	async handleNewConnection(client: Socket) {
		Logger.log(`batman new_connection`)
		const gamemode = GameMode.SOLO;
		Logger.log(`joining queue ${gamemode}`)
		client.join(gamemode);
		if (!this.queuesByGameMode.has(gamemode))
			this.queuesByGameMode.set(gamemode, []);
		this.queuesByGameMode.get(gamemode).push(client)

		await this.setStatus(client, UserStatus.INQUEUE)
		this.matchClientsForGameMode(gamemode);
	}


	// @SubscribeMessage('playerMovement')
	// handlePlayerMovement(client: Socket, action: string) {
	// 	Logger.log("batman wanna GAME playerMovement");
	// 	const room = this.clientsInGameByUserID.get(client.id);
	// 	if (room) {
	// 		room.handleMessage(client, action);
	// 	}
	// }


	//NOT WORKINGF
	@SubscribeMessage('playerMovement')
	handlePlayerMovement(client: Socket, data: { movement: PaddleAction }) {
		Logger.log('Received player movement:');
		const { movement } = data;
		Logger.log('Received player movement:', movement);

		const room = this.clientsInGameByUserID.get(client.id);
		if (room) {
			room.handleMessage(client, movement);
		}
	}

	@SubscribeMessage('gameOver')
	handleGameOver(client: Socket, payload: any) {
		const room = this.clientsInGameByUserID.get(client.id);
		if (room) {
			room.handleGameOver(client, payload);
			//unfinished
		}
	}

	//ISSUE with schedualeModule, cannot fix it, trying another approach
	// loopThroughRooms() {
	// 	this.clientsInGameByUserID.forEach((room) => {
	// 	  this.emitGameStateToPlayers(room);
	// 	});
	//   }
	
	//   emitGameStateToPlayers(room: GameRoom) {
	// 	const { playerLeftSocket, playerRightSocket, gameState } = room;
	// 	Logger.log(`batman emitGameStateToPlayers`);
		// if (room.singlemode) {
		//   playerLeftSocket.emit('gameState', gameState);
		// } else {
		//   playerLeftSocket.emit('gameState', gameState);
		//   playerRightSocket.emit('gameState', gameState);
		// }
	//   }
	
	// @Cron('*/3 * * * * *') // every 3 seconds
	// updateActiveRooms() {
	// 	Logger.log(`batman updateActiveRooms`);
	// 	this.loopThroughRooms();
	// }

	//try2 - event emitter
	private emitGameStateToPlayers(room: GameRoom) {
		const { playerLeftSocket, playerRightSocket, gameState } = room;
		if (room.singlemode) {
			playerLeftSocket.emit('pong_state', gameState);
		} else {
			playerLeftSocket.emit('pong_state', gameState);
			playerRightSocket.emit('pong_state', gameState);
		}
	}


	updateRooms() {
		this.roomsByKey.forEach((room) => {
		  //Logger.log(`batman updateRooms`);
		  // Apply the reducer function to update the game state
		const reducer = makeReducer(null);
		const newGameState: GameState = reducer(room.gameState, {
			kind: GameActionKind.updateTime,
			value: null,
		});

		// Update the game state in the room
		room.gameState = newGameState;
		  this.emitGameStateToPlayers(room);
		});
	}
	  
	  //call from init
	startRoomUpdates() {
		Logger.log(`batman startRoomUpdates`);
		setInterval(() => {
		  this.updateRooms();
		}, pongConstants.timeDlta * 1000); //in milliseconds
	}

	//-----------------------------------//

	private roomKeyForSoloUser(userID: string): string {
		return `solo ${userID}`;
	}

	private roomKeyForGameMode(gamemode: string): string {
		return `${gamemode}-${this.roomIndex}`
	}

	@SubscribeMessage('join_queue')
	async addClientToQueue(client: Socket, gamemode: GameMode) {
		//adding solo mode
		if (gamemode == GameMode.SOLO) {
			const user = await this.userFromSocket(client);
			const roomKey = this.roomKeyForSoloUser(user.id);
			// const gameRoom = new GameRoom(user.id, null, client, null);
			// this.roomsByKey.set(roomKey, gameRoom);
			// client.join(user.id);
			// this.clientsInGameByUserID.set(user.id, gameRoom);
			// this.setStatus(client, UserStatus.INGAME);
			// this.server.to(user.id).emit('start_game');
			await this.moveClientsToRoom(client, undefined, roomKey);
			return;
		}

		if (!this.queuesByGameMode.has(gamemode))
			this.queuesByGameMode.set(gamemode, []);
		this.queuesByGameMode.get(gamemode).push(client)

		await this.setStatus(client, UserStatus.INQUEUE)
		this.matchClientsForGameMode(gamemode);
	}

	private removeClientFromQueue(client: Socket, gamemode: GameMode) {
		Logger.log(`remove client ${client.id} from queue ${gamemode}`)
		const queue = this.queuesByGameMode.get(gamemode);
		if (queue) {
			const index = queue.indexOf(client);
			Logger.log(`client index to remove: ${index}`);
			if (index != -1)
				queue.splice(index, 1);
			Logger.log(`queue length after removal: ${queue.length}`)
		}
		client.leave(gamemode);
		Logger.log('removed client from queue');
	}

	private matchClientsForGameMode(gamemode: GameMode) {
		const clients = this.getClientsForGameMode(gamemode);

		Logger.log('Check for matches');

		if (clients && clients.length >= 2) {
			const client1 = clients[0];
			const client2 = clients[1];
			if (this.roomIndex < Number.MAX_SAFE_INTEGER)
				this.roomIndex++;
			else
				this.roomIndex = 0;
			this.moveClientsToRoom(client1, client2, this.roomKeyForGameMode(gamemode));
		}
	}

	private async moveClientsToRoom(client1: Socket, client2: Socket | undefined, roomkey: string) {

		Logger.log(`batman moving to ${roomkey}`)
		if (!this.roomsByKey.has(roomkey)) {
			const user1id = (await this.userFromSocket(client1)).id;
			const user2id = client2 ? (await this.userFromSocket(client2)).id : null;
			const newGameRoom = new GameRoom(user1id, user2id, client1, client2);

			const gameMode = this.getGameModeForClient(client1);
			this.removeClientFromQueue(client1, gameMode);
			if (client2) {
				this.removeClientFromQueue(client2, gameMode);
			}

			this.roomsByKey.set(roomkey, newGameRoom);
			this.roomsByKey.get(roomkey).roomName = roomkey;

			client1.join(roomkey);
			this.clientsInGameByUserID.set(user1id, newGameRoom);
			this.setStatus(client1, UserStatus.INGAME)
			client1.emit('pong_state', newGameRoom.gameState);

			if (client2) {
				client2.join(roomkey);
				this.clientsInGameByUserID.set(user2id, newGameRoom);
				this.setStatus(client2, UserStatus.INGAME)
				client2.emit('pong_state', newGameRoom.gameState);
			}

			this.server.to(roomkey).emit('start_game');
		}
	}

	private getGameModeForClient(client: Socket): GameMode | null {
		for (const [gamemode, clients] of this.queuesByGameMode) {
			if (clients.includes(client))
				return gamemode;
		}
		return null;
	}

	private getClientsForGameMode(gamemode: GameMode): Socket[] {
		return this.queuesByGameMode.get(gamemode) || [];
	}

	private async isClientInGame(client: Socket): Promise<boolean> {
		const userId = (await this.userFromSocket(client)).id;
		const userGame = this.clientsInGameByUserID.get(userId);

		Logger.log('Check for reconnecting client');
		if (userGame != undefined) {
			Logger.log('The client is reconnecting');
			client.join(userGame.roomName);
			if (userId == userGame.playerLeft)
				userGame.playerLeftSocket = client;
			else
				userGame.playerRightSocket = client;
			this.setStatus(client, UserStatus.INGAME);
			return true;
		}
		Logger.log('The client is connecting fresh');
		return false;
	}
};




// import {
// 	MessageBody,
// 	SubscribeMessage,
// 	WebSocketGateway,
// 	WebSocketServer,
// 	OnGatewayConnection, OnGatewayDisconnect
// } from '@nestjs/websockets'
// import { Server, Socket } from 'socket.io';
// import { Constants } from '../../../shared/constants'

// import { JwtService } from '@nestjs/jwt';
// import { ConnectionService } from 'src/auth/connection/connection.service';
// import { UserService } from 'src/users/user.service';
// import { User } from 'src/users/user.entity';
// import { Logger } from '@nestjs/common';
// import { parse } from 'cookie'
// import exp from 'constants';
// import { emit } from 'process';

// // Game part imports
// import { GameState, PaddleAction, GameActionKind } from '../../../shared/pongTypes';
// import { makeReducer } from '../../../shared/pongReducer';
// import { GameRoom } from './gameRoom';
// import console from 'console';

// @WebSocketGateway({
// 	cors: {
// 		origin: Constants.FRONTEND_URL,
// 		credentials: true
// 	},
// 	namespace: 'matchMakingGateway',
// })
// export class MatchMakingGateway {
// 	@WebSocketServer()
// 	server: Server;
// 	private queues: Map<string, Socket[]> = new Map();
// 	private rooms: Map<string, GameRoom> = new Map();
// 	private clientsInGame: Map<string, GameRoom> = new Map();
// 	private static roomIndex = 0;

// 	constructor(
// 		private jwtService: JwtService,
// 		private connectionService: ConnectionService,
// 		private userService: UserService
// 	) { }

// 	private userFromSocket(socket: Socket, result?: any): Promise<User> | undefined {
// 		try {
// 			if (!result) {
// 				if (!socket.handshake.headers.cookie) {
// 					Logger.log("Cookie's gone");
// 					return;
// 				}
// 				const auth_cookie = parse(socket.handshake.headers.cookie).Authentication;
// 				result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET })
// 			}
// 			return this.connectionService.get({ id: result.id }, ['user']).then(connection => {
// 				return connection.user;
// 			});
// 		}
// 		catch (e) {
// 		}
// 		return undefined;
// 	}

// 	private async setStatus(client: Socket, newStatus: string) {
// 		const auth_cookie = parse(client.handshake.headers.cookie).Authentication;
// 		let result = undefined;

// 		try {
// 			result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET });
// 			if (!result)
// 				throw new Error('Invalid Token');
// 		} catch {
// 			client.disconnect();
// 			return;
// 		}
// 		const user = await this.userFromSocket(client, result)
// 		user.status = newStatus;
// 		user.save();
// 		Logger.log(`${user.userName} status: ${user.status}`);
// 	}

// 	private async statusOnDisconnect(client: Socket) {
// 		const user = await this.userFromSocket(client);

// 		if (user.status != 'offline') {
// 			Logger.log('user is online');
// 			user.status = 'online';
// 			user.save();
// 		}
// 		else
// 			Logger.log('user is offline');
// 	}

// 	afterInit(server: Server) {
// 		Logger.log('waitlist')
// 	}

// 	handleConnection(client: Socket) {
// 		if (!client.handshake.headers.cookie) {
// 			Logger.log('Lost the Cookie');
// 			return;
// 		}
// 		this.isClientInGame(client).then((result: boolean) => {
// 			if (!result) {
// 				client.emit('new_connection');
// 				Logger.log(`new queue connection ${client.id}`);
// 			} else {
// 				client.emit('start_game');
// 			}
// 		}).catch(e => console.error(e));
// 	}

// 	handleDisconnect(client: Socket) {
// 		const currentQueue = this.getClientQueue(client);
// 		if (currentQueue) {
// 			this.removeClientFromQueue(client, currentQueue);
// 		}
// 		this.statusOnDisconnect(client);
// 		Logger.log(`disconnected ${client.id}`);
// 	}

// 	//-----------gameplay----------------//


// 	@SubscribeMessage('playerMovement')
// 	handlePlayerMovement(client: Socket, action: string) {
// 		Logger.log("GAME playerMovement");
// 		const room = this.clientsInGame.get(client.id);
// 		if (room) {
// 			room.handleMessage(client, action);
// 		}
// 	}

// 	@SubscribeMessage('gameOver')
// 	handleGameOver(client: Socket, payload: any) {
// 		const room = this.clientsInGame.get(client.id);
// 		if (room) {
// 			Logger.log("GAME gameOver");
// 			room.handleGameOver(client, payload);
			
// 			//unfinished
// 		}
// 	}
// 	//-----------------------------------//

// 	@SubscribeMessage('join_queue')
// 	async addClientToQueue(client: Socket, queue: { gamemode: string }) {
// 		Logger.log(`joining queue ${queue.gamemode}`)
// 		client.join(queue.gamemode);

// 		//adding solo mode
// 		if (queue.gamemode == 'solo') {
// 			const user = await this.userFromSocket(client);
// 			const gameRoom = new GameRoom(user.id, null, client, null);
// 			this.rooms.set(user.id, gameRoom);
// 			this.clientsInGame.set(user.id, gameRoom);
// 			this.setStatus(client, 'ingame');
// 			this.server.to(user.id).emit('start_game');
// 			return;
// 		}

// 		if (!this.queues.has(queue.gamemode))
// 			this.queues.set(queue.gamemode, []);
// 		this.queues.get(queue.gamemode).push(client)

// 		await this.setStatus(client, 'in_queue')
// 		this.matchClientsInQueue(queue.gamemode);
// 	}

// 	private removeClientFromQueue(client: Socket, queue: string) {
// 		const clients = this.queues.get(queue);
// 		if (clients) {
// 			const index = clients.indexOf(client);
// 			Logger.log(`client index to remove: ${index}`);
// 			if (index != -1)
// 				clients.splice(index, 1);
// 			Logger.log(`queue length after removal: ${this.queues.get(queue).length}`)
// 		}
// 		client.leave(queue);
// 		Logger.log('removed client from queue');
// 	}

// 	private matchClientsInQueue(queue: string) {
// 		const clients = this.getClientsInQueue(queue);

// 		Logger.log('Check for matches');

// 		if (clients && clients.length >= 2) {
// 			const client1 = clients[0];
// 			const client2 = clients[1];
// 			const gameRoom = `${queue}-${MatchMakingGateway.roomIndex}`;
// 			if (MatchMakingGateway.roomIndex < Number.MAX_SAFE_INTEGER)
// 				MatchMakingGateway.roomIndex++;
// 			else
// 				MatchMakingGateway.roomIndex = 0;
// 			this.moveClientsToRoom(client1, client2, gameRoom);
// 		} else if (clients && clients.length == 1) { //added for solo mode
// 			const client = clients[0];
// 			this.setStatus(client, 'in_queue solo');
// 		}
// 	}

// 	private async moveClientsToRoom(client1: Socket, client2: Socket, roomkey: string) {

// 		Logger.log(`moving to ${roomkey}`)
// 		if (!this.rooms.has(roomkey)) {
// 			const user1id = (await this.userFromSocket(client1)).id;
// 			const user2id = (await this.userFromSocket(client2)).id;
// 			const newGame = new GameRoom(user1id, user2id, client1, client2);

// 			const currentQueue = this.getClientQueue(client1);
// 			this.removeClientFromQueue(client1, currentQueue);
// 			this.removeClientFromQueue(client2, currentQueue);

// 			this.rooms.set(roomkey, newGame);
// 			this.rooms.get(roomkey).roomName = roomkey;

// 			client1.join(roomkey);
// 			this.clientsInGame.set(user1id, newGame);
// 			this.setStatus(client1, 'ingame')

// 			client2.join(roomkey);
// 			this.clientsInGame.set(user1id, newGame);
// 			this.setStatus(client2, 'ingame')

// 			this.server.to(roomkey).emit('start_game');
// 		}
// 	}

// 	private getClientQueue(client: Socket): string {
// 		for (const [queue, clients] of this.queues) {
// 			if (clients.includes(client))
// 				return queue;
// 		}
// 		return null;
// 	}

// 	private getClientsInQueue(queue: string): Socket[] {
// 		return this.queues.get(queue) || [];
// 	}

// 	private async isClientInGame(client: Socket): Promise<boolean> {
// 		const userId = (await this.userFromSocket(client)).id;
// 		const userGame = this.clientsInGame.get(userId);

// 		Logger.log('Check for reconnecting client');
// 		if (userGame != undefined) {
// 			Logger.log('The client is reconnecting');
// 			client.join(userGame.roomName);
// 			if (userId == userGame.playerLeft)
// 				userGame.playerLeftSocket = client;
// 			else
// 				userGame.playerRightSocket = client;
// 			this.setStatus(client, 'ingame');
// 			return true;
// 		}
// 		Logger.log('The client is connecting fresh');
// 		return false;
// 	}
// };
