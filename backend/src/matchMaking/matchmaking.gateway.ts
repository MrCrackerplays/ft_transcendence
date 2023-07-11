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


// Game part imports
import { GameState, PaddleAction, GameActionKind, GameMode } from '../../../shared/pongTypes';
import { makeReducer } from '../../../shared/pongReducer';
import { pongConstants } from '../../../shared/pongTypes';
import { GameRoom } from './gameRoom';
// import { Cron } from '@nestjs/schedule';
import { EventEmitter } from 'events';

import { Match } from 'src/matches/match.entity';
import { MatchService } from 'src/matches/match.service';
import { PublicMatch } from '../../../shared/public-match'
import { number } from '@hapi/joi';


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
		private userService: UserService,
		private matchService: MatchService
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
			Logger.log(`${user?.userName} is idle`);
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
				//Logger.log('batman emit new_connection');
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
		Logger.log(`disconnected from game ${client.id}`);
	}

	//---------------------------------------gameplay----------------------------//

	// @SubscribeMessage('new_connection') // "new_connection" event
	// async handleNewConnection(client: Socket) {
	// 	Logger.log(`new_connection`)
	// 	const gamemode = GameMode.SOLO;
	// 	Logger.log(`joining queue ${gamemode}`)
	// 	client.join(gamemode);
	// 	if (!this.queuesByGameMode.has(gamemode))
	// 		this.queuesByGameMode.set(gamemode, []);
	// 	this.queuesByGameMode.get(gamemode).push(client)

	// 	await this.setStatus(client, UserStatus.INQUEUE)
	// 	this.matchClientsForGameMode(gamemode);
	// }

	@SubscribeMessage('playerMovement')
	async handlePlayerMovement(client: Socket, data: { movement: PaddleAction }) : Promise<void> {
		const { movement } = data;
		Logger.log('Received player movement:', movement);
		const user = await this.userFromSocket(client);
		const room = this.clientsInGameByUserID.get(user.id);

		if (room) {
			room.handleMessage(client, movement);
		} else {
			Logger.log('no room for user', this.clientsInGameByUserID.get(user.id));
		}
	}

	async handleGameOver(room: GameRoom, gameplayInterval: any) {
		Logger.log('GAME HAS ENDED');
		const user1 = await this.userFromSocket(room.playerLeftSocket);
		const user2 = await this.userFromSocket(room.playerRightSocket);
		// const matchResult = MatchService.createMatch(payload.winner, payload.loser, payload.winnerScore, payload.loserScore);
		clearInterval(gameplayInterval);

		Logger.log(`${user1.userName}`);
		Logger.log(`${user2.userName}`);
		if (room) {
			user1.gamesPlayed++;
			user2.gamesPlayed++;
			Logger.log(`${room.roomName}`)
			// room.handleGameOver(client, payload);
			room.winner = room.gameState.winner;
			Logger.log(`winner: ${room.gameState.winner}`);
			if (user1.id == room.winner) {
				user1.gamesWon++;
				this.matchService.createMatch(user1, user2, room.gameState.leftPaddle.score, room.gameState.rightPaddle.score);
				Logger.log(`winner: ${user1.userName}`);
			}
			else if(user2.id == room.winner) {
				user2.gamesWon++;
				this.matchService.createMatch(user2, user1, room.gameState.rightPaddle.score, room.gameState.leftPaddle.score);
				Logger.log(`winner: ${user2.userName}`); 
			}
			else
				Logger.log(`NO WINNER FOUND`);
			user1.save();
			user2.save();
			
			this.roomsByKey.delete(room.roomName);
			this.clientsInGameByUserID.delete(user1.id);
			this.clientsInGameByUserID.delete(user2.id);
			this.server.to(room.roomName).emit('end_game');
			room.playerLeftSocket.disconnect();
			room.playerRightSocket.disconnect();
		}
		else
			Logger.log(`NO ROOM FOUND`);
	}

	private emitGameStateToPlayers(room: GameRoom) {
		const { playerLeftSocket, playerRightSocket, gameState } = room;
		if (room.singlemode) {
			playerLeftSocket.emit('pong_state', gameState);
		} else {
			playerLeftSocket.emit('pong_state', gameState);
			playerRightSocket.emit('pong_state', gameState);
		}
	}


	updateRooms(gameplayInterval: any) {
		this.roomsByKey.forEach((room) => {
		  //Logger.log(`batman updateRooms`);
		const reducer = makeReducer(null);
		const newGameState: GameState = reducer(room.gameState, {
			kind: GameActionKind.updateTime,
			value: null,
		});
		room.gameState = newGameState;
		if (room.gameState.gameOver){
			this.handleGameOver(room, gameplayInterval);
		}
		else
			this.emitGameStateToPlayers(room);
		});
	}

	startRoomUpdates() {
		//Logger.log(`batman startRoomUpdates`);
		let gameplayInterval = setInterval(() => {
		  this.updateRooms(gameplayInterval);
		}, pongConstants.timeDlta * 1000); //in milliseconds
	}
	//--------------------------------------------------------------------------//

	private roomKeyForSoloUser(userID: string): string {
		return `solo-${userID}`;
	} 

	private roomKeyForGameMode(gamemode: string): string {
		return `${gamemode}-${this.roomIndex}`
	}
 
	@SubscribeMessage('join_queue')
	async addClientToQueue(client: Socket, gamemode: GameMode) {
		
		//adding solo mode
		if (gamemode == GameMode.SOLO) {
			const user = await this.userFromSocket(client);
			
			//trying to fix roomkey issue
			const roomKey = this.roomKeyForSoloUser(user.id);
			this.roomIndex++;
			//console.log('addClientToQueue: roomKey:', roomKey);
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

		console.log(`moveClientsToRoom ${roomkey}`, 'client1', client1.id, 'client2',client2?.id);

		if (!this.roomsByKey.has(roomkey)) {
			const user1id = (await this.userFromSocket(client1)).id;
			const user2id = client2 ? (await this.userFromSocket(client2)).id : null;
			const newGameRoom = new GameRoom(user1id, user2id, client1, client2, roomkey);

			const gameMode = this.getGameModeForClient(client1);
			if (!client2) { //added this monstrocity as getGameModeForClient logs as gameMode: null
				newGameRoom.singlemode = true;
			}
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
			// this.server.to(roomkey).emit('pong_state');
		}
	}

	@SubscribeMessage('game_started')
	async sendGameState(client: Socket) {
		const userId = (await this.userFromSocket(client)).id;
		const userGame = this.clientsInGameByUserID.get(userId);

		client.emit('pong_state', userGame.gameState);
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
