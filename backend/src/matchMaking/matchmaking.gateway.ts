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
	namespace: 'api/matchMakingGateway',
})


export class MatchMakingGateway {
	@WebSocketServer()
	server: Server;
	private queuesByGameMode: Map<GameMode, Socket[]> = new Map();
	private roomsByKey: Map<string, GameRoom> = new Map();
	private clientsInGameByUserID: Map<string, GameRoom> = new Map();
	private clientsInQueueByUserID: Map<string, GameMode> = new Map();
	private roomIndex = 0;
	private readonly eventEmitter: EventEmitter = new EventEmitter();
	
	constructor(
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private userService: UserService,
		private matchService: MatchService
		) { }
		
		afterInit(server: Server) {
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
				this.isClientInQueue(client).then((isClientInQueue: Boolean) => {
					if (!isClientInQueue)
					client.emit('new_connection');
					Logger.log(`new queue connection ${client.id}`);
				}).catch(e => {})
			}
		}).catch(e => {});
	}
	
	async handleDisconnect(client: Socket) {
		const gamemode = this.getGameModeForClient(client);
		const gameroom = this.clientsInGameByUserID.get((await this.userFromSocket(client)).id)
		
		if (gamemode)
		this.removeClientFromQueue(client, gamemode);
		if (gameroom && gameroom.singlemode)
		this.clearUpSoloRoom(gameroom);
		this.statusOnDisconnect(client);
	}
	
	/*---------------------------------------Queues------------------------------*/
	
	@SubscribeMessage('join_queue')
	async addClientToQueue(client: Socket, gamemode: GameMode) {
		
		if (gamemode == GameMode.SOLO) {
			const user = await this.userFromSocket(client);
			
			const roomKey = this.roomKeyForSoloUser(user.id);
			this.roomIndex++;
			await this.moveClientsToRoom(client, undefined, roomKey);
			return;
		}
		
		if (!this.queuesByGameMode.has(gamemode))
		this.queuesByGameMode.set(gamemode, []);
		if (gamemode.toString().startsWith(GameMode.INVITE) && this.queuesByGameMode.get(gamemode).length >= 2)
		client.emit('room_full');
		this.queuesByGameMode.get(gamemode).push(client);
		this.clientsInQueueByUserID.set((await this.userFromSocket(client)).id, gamemode);
		await this.setStatus(client, UserStatus.INQUEUE);
		this.matchClientsForGameMode(gamemode);
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
	
	private async isClientInQueue(client: Socket): Promise<boolean> {
		const userId = ((await this.userFromSocket(client)).id)
		const userQueue = this.clientsInQueueByUserID.get(userId);

		if (userQueue != undefined) {
			return true;
		}
		return false;
	}
	
	private async removeClientFromQueue(client: Socket, gamemode: GameMode) {
		const queue = this.queuesByGameMode.get(gamemode);
		if (queue) {
			const index = queue.indexOf(client);
			if (index != -1)
			queue.splice(index, 1);
		} 
		client.leave(gamemode);
		this.clientsInQueueByUserID.delete((await this.userFromSocket(client)).id)
		if (gamemode != GameMode.CLASSIC && gamemode != GameMode.INVITE) {
			if (queue?.length == 0)
			this.queuesByGameMode.delete(gamemode);
		}
	}
	
	/*---------------------------------------------------------------------------*/
	
	private matchClientsForGameMode(gamemode: GameMode) {
		const clients = this.getClientsForGameMode(gamemode);
		
		if (clients && clients.length >= 2) {
			const client1 = clients[0];
			const client2 = clients[1];
			if (this.roomIndex < Number.MAX_SAFE_INTEGER)
			this.roomIndex++;
			else
			this.roomIndex = 0;
			if (gamemode.toString().startsWith(GameMode.INVITE))
			this.moveClientsToRoom(client1, client2, gamemode);
			else
			this.moveClientsToRoom(client1, client2, this.roomKeyForGameMode(gamemode));
		}
	}
	
	/*---------------------------------------rooms-------------------------------*/
	
	private async moveClientsToRoom(client1: Socket, client2: Socket | undefined, roomkey: string) {
		if (!this.roomsByKey.has(roomkey)) {
			const user1id = (await this.userFromSocket(client1)).id;
			const user2id = client2 ? (await this.userFromSocket(client2)).id : null;
			const newGameRoom = new GameRoom(user1id, user2id, client1, client2, roomkey);
	
			const gameMode = this.getGameModeForClient(client1);
			if (!client2) //added this monstrocity as getGameModeForClient logs as gameMode: null
				newGameRoom.singlemode = true;
			if (gameMode == GameMode.CLASSIC) {
				this.removeClientFromQueue(client1, gameMode);
				if (client2)
					this.removeClientFromQueue(client2, gameMode);
			}
			
			this.roomsByKey.set(roomkey, newGameRoom);
			this.roomsByKey.get(roomkey).roomName = roomkey;
	
			client1.join(roomkey);
			this.clientsInGameByUserID.set(user1id, newGameRoom);
			this.setStatus(client1, UserStatus.INGAME)
	
			if (client2) {
				client2.join(roomkey);
				this.clientsInGameByUserID.set(user2id, newGameRoom);
				this.setStatus(client2, UserStatus.INGAME)
			}
			this.server.to(roomkey).emit('pong_state', newGameRoom.gameState);
			this.server.to(roomkey).emit('start_game');
		}
	}
	
	@SubscribeMessage('game_started')
	async sendGameState(client: Socket) {
		const userId = (await this.userFromSocket(client)).id;
		const userGame = this.clientsInGameByUserID.get(userId);
		
		client.emit('pong_state', userGame.gameState);
	}
	
	private async isClientInGame(client: Socket): Promise<boolean> {
		const userId = (await this.userFromSocket(client)).id;
		const userGame = this.clientsInGameByUserID.get(userId);
	
		if (userGame != undefined) {
			client.join(userGame.roomName);
			if (userId == userGame.playerLeft)
			userGame.playerLeftSocket = client;
			else
			userGame.playerRightSocket = client;
			this.setStatus(client, UserStatus.INGAME);
			return true;
		}
		return false;
	}
	
	private roomKeyForSoloUser(userID: string): string {
		return `solo-${userID}`;
	} 

	private roomKeyForGameMode(gamemode: string): string {
		return `${gamemode}-${this.roomIndex}`
	}

	/*---------------------------------------------------------------------------*/
	
	//---------------------------------------gameplay----------------------------//
	
	@SubscribeMessage('playerMovement')
	async handlePlayerMovement(client: Socket, data: { movement: PaddleAction }) : Promise<void> {
		const { movement } = data;
		// Logger.log('Received player movement:', movement);
		const user = await this.userFromSocket(client);
		const room = this.clientsInGameByUserID.get(user.id);

		if (room) {
			room.handleMessage(client, movement);
		} else {
			Logger.log('no room for user', this.clientsInGameByUserID.get(user.id));
		}
	}

	
	updateRooms() {
		this.roomsByKey.forEach((room) => {
			//Logger.log(`batman updateRooms`);
			const reducer = makeReducer(null);
			const newGameState: GameState = reducer(room.gameState, {
				kind: GameActionKind.updateTime,
				value: null,
			});
			// Logger.log(`CHECK PLAYER 2 IN SOLO: ${room.playerRightSocket}`);
			// Logger.log(`Check gamestate in room updates: ${newGameState.gameOver}`);
			room.gameState = newGameState;
			if (!room.gameState.gameClosing)
			{
				if (room.gameState.gameOver) {
					room.gameState.gameClosing = true;
					this.handleGameOver(room);
				}
				else
				this.server.to(room.roomName).emit('pong_state', room.gameState);
			}
		});
	}

	startRoomUpdates() {
		Logger.log(`batman startRoomUpdates`);
		let gameplayInterval = setInterval(() => {
			this.updateRooms();
		}, pongConstants.timeDlta * 1000); //in milliseconds
	}
	//--------------------------------------------------------------------------//
	
	/*-------------------------------gameover-----------------------------------*/
	
	private handleGameOver(room: GameRoom) {
		if (room) {
			room.winner = room.gameState.winner;
			if (room.singlemode)
				this.clearUpSoloRoom(room);
			else if (room.roomName.startsWith(GameMode.INVITE))
				this.clearUpPrivateRoom(room);
			else
				this.clearUpClassicRoom(room);
		}
		else
			Logger.log(`NO ROOM FOUND`);
	}

	private async clearUpClassicRoom(room: GameRoom) {
		const user1 = await this.userFromSocket(room.playerLeftSocket);
		const user2 = await this.userFromSocket(room.playerRightSocket);

		user1.gamesPlayed++;
		user2.gamesPlayed++;
		if (room.winner == user1.id) {
			user1.gamesWon++;
			this.matchService.createMatch(user1, user2, room.gameState.leftPaddle.score, room.gameState.rightPaddle.score);
			room.playerLeftSocket.emit('victory');
			room.playerRightSocket.emit('defeat');
		}
		else if(room.winner == user2.id) {
			user2.gamesWon++;
			this.matchService.createMatch(user2, user1, room.gameState.rightPaddle.score, room.gameState.leftPaddle.score);
			room.playerLeftSocket.emit('defeat');
			room.playerRightSocket.emit('victory');
		}
		else
			Logger.log(`NO WINNER FOUND`);
		user1.save();
		user2.save();
		
		this.roomsByKey.delete(room.roomName);
		this.clientsInGameByUserID.delete(user1.id);
		this.clientsInGameByUserID.delete(user2.id);
		room.playerLeftSocket.emit('end_game');
		room.playerRightSocket.emit('end_game');
		room.playerLeftSocket.disconnect();
		room.playerRightSocket.disconnect();
	}

	private async clearUpPrivateRoom(room: GameRoom) {
		const gameMode = this.getGameModeForClient(room.playerLeftSocket);
		
		this.removeClientFromQueue(room.playerLeftSocket, gameMode);
		this.removeClientFromQueue(room.playerRightSocket, gameMode);
		this.queuesByGameMode.delete(gameMode);
		this.clearUpClassicRoom(room);
	}

	private async clearUpSoloRoom(room: GameRoom) {
		const user = await this.userFromSocket(room.playerLeftSocket);
		
		this.roomsByKey.delete(room.roomName);
		this.clientsInGameByUserID.delete(user.id);
		this.server.to(room.roomName).emit('end_game');
		room.playerLeftSocket.disconnect();
	}

	/*---------------------------------------------------------------------------*/

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
};
