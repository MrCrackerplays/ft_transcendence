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
import { ConnectionService } from 'src/auth/connection/connection.service';
import { MessageService } from 'src/channel/message/message.service';
import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/users/user.service';
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
		private channelService: ChannelService,
		private userService: UserService,
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
			console.log("trying to join to all subscribed channels");
			if (!user || !user.channelSubscribed) {
				console.log("failed to join to all subscribed channels");
				return;
			}
			console.log("joining to all subscribed channels");
			for (var i = 0; i < user.channelSubscribed.length; i++) {
				// client.join(user.channelSubscribed[i].id);
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
	createChannel(@ConnectedSocket() client: Socket, @MessageBody("channel") channel_name : string): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.channelService.create(user, { name: channel_name, visibility: 0, password: null });
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('subscribe')
	async subscribeChannel(@ConnectedSocket() client: Socket, @MessageBody("channel") channel_id, @MessageBody("password") password : string): Promise<Boolean> {
		const user = await this.userFromSocket(client);
		if (!user)
			return false;
		const channel = await this.userService.subscribeToChannel(user, { channelID: channel_id, password: password });
		if (!channel)
			return false;
		return true;
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('join')
	async joinChannel(@ConnectedSocket() client: Socket, @MessageBody("channel") channel_id : string): Promise<boolean> {
		const user = await this.userFromSocket(client);
		if (!user)
			return false;
		console.log("user:", user);
		const channel = await this.channelService.findOne(channel_id);
		if (!channel)
			return false;
		//TODO: check if user is subscribed to channel, currently no way to do it
		client.join(channel_id);
		this.server.to(channel_id).emit("join", { channel: channel_id, content: user.userName + " has joined the channel" });
		return true;
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