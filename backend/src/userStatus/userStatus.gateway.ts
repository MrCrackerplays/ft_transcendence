import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection, OnGatewayDisconnect
}	from '@nestjs/websockets'
import { Server, Socket } from 'socket.io';
import  { Constants } from '../../../shared/constants'

import { JwtService } from '@nestjs/jwt';
import { ConnectionService } from 'src/auth/connection/connection.service';
import { UserService } from 'src/users/user.service';
import { User, UserStatus } from 'src/users/user.entity';
import { Logger } from '@nestjs/common';
import { parse } from 'cookie'

@WebSocketGateway ({
	cors: {
		origin: Constants.FRONTEND_URL,
		credentials: true
	},
	namespace: 'api/userStatusGateway',
})
export class UserStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private userService: UserService
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
				if (connection == null) {
					return undefined;
				}
				return connection.user;
			});
		}
		catch (e){
		}
		return undefined;
	}

	private	setStatus(user: User, newStatus: UserStatus)
	{
		user.status = newStatus;
		user.save();
	}
	
	afterInit(server: Server) {
		Logger.log('Frieds list connection initialized');
	}	

	handleConnection(client: Socket) {
		Logger.log(`new user status connection ${client.id}`);
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
			try {client.disconnect();} catch { return; }
			return ;
		}
		this.userFromSocket(client, result).then(user => {
			if (!user)
				return ;
			this.setStatus(user, UserStatus.IDLE);
		})
	}

	handleDisconnect(client: Socket) {
		this.userFromSocket(client).then(user => {
			if (!user)
				return ;
			this.setStatus(user, UserStatus.OFFLINE)
		})
		Logger.log(`user status disconnected ${client.id}`)
	}
};
