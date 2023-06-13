import { func } from '@hapi/joi';
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
	ConnectedSocket
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
export class userStatusGateway {
	@WebSocketServer()
	Server: Server;

	constructor(
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private userService: User,
	) {}

	private userFromSocket(socket: Socket, result?: any): Promise<User> | undefined {
		try {
			if (!result) {
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
	
	afterInit(server: Server) {
		Logger.log('Frieds list connection initialized');
	}	

	@SubscribeMessage('UPDATE')
	setStatus(@ConnectedSocket() client: Socket, newStatus: string)
	{
		this.userFromSocket(client).then(user => {
			if (!user)
				return ;
			
			user.status = newStatus;
		});
	}

};
