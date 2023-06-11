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

@WebSocketGateway ({
	cors: {
		origin: Constants.FRONTEND_URL,
		credentials: true
	},
	namespace: 'friendfistgateway',
})
export class FriendListGateway {
	@WebSocketServer()
	Server: Server;

	constructor(
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private userService: User,
	) {}

	afterInit(server: Server) {
		Logger.log('Frieds list connection initialized');
	}
};