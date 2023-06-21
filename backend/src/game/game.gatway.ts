import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection, OnGatewayDisconnect
}	from '@nestjs/websockets'
import { Server, Socket } from 'socket.io';
import  { Constants } from '../../../shared/constants'

import { JwtService } from '@nestjs/jwt';
import { ConnectionService } from 'src/auth/connection/connection.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';
import { Logger } from '@nestjs/common';
import { parse } from 'cookie'

@WebSocketGateway({
	cors: {
		origin: Constants.FRONTEND_URL,
		credentials: true
	},
	namespace: 'gameGateway'	
})
export class gameGateway {
	@WebSocketServer()
	server: Server;

	constructor (
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private userService: UserService
	) {}

	afterInit() {
		this.
	}
}