import { Logger, UseGuards } from '@nestjs/common';
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
	ConnectedSocket,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { JwtService } from "@nestjs/jwt";
import { ConnectionService } from 'src/auth/connection.service';
import { MessageService } from 'src/message/message.service';
import { ChannelService } from 'src/channel/channel.service';
import { WsGuard } from 'src/auth/guards/wsguard.guard';
import { User } from 'src/users/user.entity';
import { parse } from 'cookie';


@WebSocketGateway({
	cors: {
		origin: 'http://localhost:5173',
		credentials: true
	},
})
export class ChatGateway {
	@WebSocketServer()
	server: Server;
	// connectionService: ConnectionService;
	constructor(
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private messageService: MessageService,
		private channelService: ChannelService
		) { }
	private incrementer: number = 0;

	private userFromSocket(socket: Socket, result?: any): Promise<User> | undefined {
		try {
			if (!result) {
				const auth_cookie = parse(socket.handshake.headers.cookie).Authentication;
				result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET })
			}
			return this.connectionService.get({ id: result.id }, ['user']).then(connection => {
				return connection.user;
			});
		} catch (e) {
		}
		return undefined;
	}

	afterInit(server: Server) {
		Logger.log('chat Server initialized');
	}

	handleConnection(client: Socket) {
		this.incrementer++;
		console.log(`new connection ${client.id}`, this.incrementer);
		const auth_cookie = parse(client.handshake.headers.cookie).Authentication;
		let result = undefined;
		try {
			result = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET });
			if (!result)
				throw new Error("Invalid Token");
		} catch (e) {
			client.disconnect();
			return;
		}
		this.userFromSocket(client, result).then(user => {
			if (!user || !user.channelSubscribed)
				return;
			for (var i = 0; i < user.channelSubscribed.length; i++) {
				client.join(user.channelSubscribed[i].id);
			}
		});
		console.log(1, result);
	}

	handleDisconnect(client: Socket) {
		Logger.log(`disconnected ${client.id}`);
	}

	//TODO: remove
	@UseGuards(WsGuard)
	@SubscribeMessage('events')
	findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
		return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('create')
	createChannel(@ConnectedSocket() client: Socket, @MessageBody("channel") channel_id : string): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.channelService.createOne({ name: channel_id, ownerID: user.id });
		});
	}

	//TEMPORARY WAY TO JOIN CHANNELS, REMOVE IF ANOTHER WAY TO JOIN CHANNELS GETS ADDED
	@UseGuards(WsGuard)
	@SubscribeMessage('join')
	joinChannel(@ConnectedSocket() client: Socket, @MessageBody("channel") channel_id : string): Promise<boolean> {
		return this.userFromSocket(client).then(user => {
			if (!user)
				return false;
			return this.channelService.findOne(channel_id).then(channel => {
				if (!channel)
					return false;
				client.join(channel_id);
				//TODO: if this function becomes the main way to join channels, add the channel to the User's subscribed channels
				this.server.to(channel_id).emit("join", {channel: channel_id, content: user.userName + " has joined the channel"});
				return true
			});
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('message')
	receiveMessage(@ConnectedSocket() socket: Socket, @MessageBody("channel") channel_id : string, @MessageBody("message") message: string): void {
		try {
			this.userFromSocket(socket).then(user => {
				if (!user)
					return;
				this.channelService.findOne(channel_id).then(channel => {
					if (!channel)
						return;
					this.messageService.createMessage(channel, user, message).then((m) => {
						console.log("sending message");
						this.server.to(channel_id).emit("message", {channel: channel_id, sender: m.author.userName, content: m.content, date: m.date});
					});
				});
			});
		} catch (e) {
		}
	}

	//TODO: remove
	@UseGuards(WsGuard)
	@SubscribeMessage('identity')
	async identity(@MessageBody() data: number): Promise<number> {
		return data;
	}
}