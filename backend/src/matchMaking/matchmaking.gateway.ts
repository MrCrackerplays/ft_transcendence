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
	private setStatus(user: User, newStatus: string) {
		user.status = newStatus;
		user.save();
	}
	afterInit(server: Server) {
		Logger.log('waitlist')
	}
	handleConnection(client: Socket) {
		if (!client.handshake.headers.cookie) {
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
				return;
			this.setStatus(user, 'online')
			// console.log(`${user.status}`);
		})
		Logger.log(`disconnected ${client.id}`)
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
};

import {GameState} from '../../../shared/gameTypes' ;

export class GameRoom {

	playerLeft: string;
	playerRight: string;
	playerLeftSocket: Socket;
	playerRightSocket: Socket;
	roomName: string;
	

GameState: GameState;


};