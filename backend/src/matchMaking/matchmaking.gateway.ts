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
import { emit } from 'process';

@WebSocketGateway ({
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

	constructor (
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
		Logger.log('waitlist')
	}
	
	handleConnection(client: Socket) {
		Logger.log(`new queue connection ${client.id}`);
		if (!client.handshake.headers.cookie)
		{
			Logger.log('Lost the Cookie');
			return ;
		}
		const auth_cookie = parse(client.handshake.headers.cookie).Authentication;
		let result = undefined;
		try {
			result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET });
			if (!result)
			throw new Error('Invalid Token');
		} catch {
			client.disconnect();
			return ;
		}
		this.userFromSocket(client, result).then(user => {
			this.setStatus(user, 'in_queue');
		})
	}
	
	handleDisconnect(client: Socket) {
		this.userFromSocket(client).then(user => {
			if (!user)
			return ;
			this.setStatus(user, 'online');
			console.log(`${user.status}`);
		})
		Logger.log(`disconnected ${client.id}`);
	}

	handleJoinRoom(client: Socket, room: string) {
		client.join(room);
		client.emit("joinedRoom");
	}
	
	@SubscribeMessage('leave_room')
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit("leftRoom", room);
	}
	
	@SubscribeMessage('join_room')
	private addClientToQueue(client: Socket, queue: string) {
		Logger.log(`joining queue ${queue}`)
		client.join(queue);
		if (!this.queues.has(queue))
			this.queues.set(queue, []);
		this.queues.get(queue).push(client)
		client.emit('joinedRoom');
	}
	
	private removeClientFromQueue(queue: string, client: Socket) {
		const clients  = this.queues.get(queue);
		if (clients) {
			const index = clients.indexOf(client);
			if (index != -1) {
				clients.splice(index, 1);
			}
		}
		client.leave(queue);
	}

	private matchClientsInQueue(queue: string) {
		const clients = this.queues.get(queue)

		if (clients && clients.length >= 2) {
			const client1 = clients[0];
			const client2 = clients[1];
			const gameRoom = 'gameRoom';
		}
	}

	private moveClientsToRoom(client1: Socket, client2: Socket, room: string) {
		const currentQueue = this.getClientRoom(client1);
		this.removeClientFromQueue(currentQueue, client1);
		this.removeClientFromQueue(currentQueue, client2);

		
	}

	private getClientRoom(client: Socket): string {
		for (const [queue, clients] of this.queues) {
			if (clients.includes(client))
				return queue;
		}
		return null;
	}

	private getClientsInQueue(queue: string): Socket[] {
		return this.queues.get(queue) || [];
	}
};