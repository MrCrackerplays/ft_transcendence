import {
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
	ConnectedSocket,
	OnGatewayConnection, OnGatewayDisconnect
}	from '@nestjs/websockets'
import { Server, Socket } from 'socket.io';
import  { Constants } from '../../../shared/constants'

import { JwtService } from '@nestjs/jwt';
import { ConnectionService } from 'src/auth/connection/connection.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';
import { Logger, UseGuards } from '@nestjs/common';
import { parse } from 'cookie'
import { EventListenerObject } from 'rxjs/internal/observable/fromEvent';

@WebSocketGateway ({
	cors: {
		origin: Constants.FRONTEND_URL,
		credentials: true
	},
	namespace: 'userStatusGateway',
})
export class UserStatusGateway implements OnGatewayConnection, OnGatewayDisconnect{
	@WebSocketServer()
	Server: Server;

	constructor(
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private userService: UserService,
	) {}

	private userFromSocket(socket: Socket, result?: any): Promise<User> | undefined {
		try {
			if (!result) {
				if (!socket.handshake.headers.cookie)
				{
					Logger.log("Cookie's gone");
					return ;
				}
				const auth_cookie = parse(socket.handshake.headers.cookie).Authentication;
				result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET })
			}
			return this.connectionService.get({ id: result.id }, ['user']).then(connection => {
				return connection.user;
			});
		}
		catch (e){
		}
		return undefined;
	}

	private	setStatus(user: User, newStatus: string)
	{
		user.status = newStatus;
		user.save();
	}
	
	afterInit(server: Server) {
		Logger.log('Frieds list connection initialized');
	}	

	handleConnection(client: Socket) {
		Logger.log(`new connection ${client.id}`);
		if (!client.handshake.headers.cookie)
		{
			Logger.log("Cookie's gone");
			return ;
		}
		const auth_cookie = parse(client.handshake.headers.cookie).Authentication;
		let result = undefined;
		try {
			result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET });
			if (!result)
				throw new Error('Invalid Token');
		} catch (e) {
			client.disconnect();
			return ;
		}
		this.userFromSocket(client, result).then(user => {
			if (!user)
				return ;
			this.setStatus(user, 'online');
			// console.log(`${user.userName}: ${user.status}`);
		})
	}

	handleDisconnect(client: Socket) {
		this.userFromSocket(client).then(user => {
			if (!user)
				return ;
			this.setStatus(user, 'offline')
			// console.log(`${user.status}`);
		})
		Logger.log(`disconnected ${client.id}`)
	}
};
