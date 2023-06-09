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
	namespace: 'chat',
})
export class ChatGateway {
	@WebSocketServer()
	server: Server;
	// connectionUser: Map<string, User> = new Map<string, User>();
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
			// console.log("trying to join to all subscribed channels");
			if (!user || !user.id) {
				// console.log("failed to join to all subscribed channels");
				return;
			}
			// this.connectionUser.set(client.id, user);
			client.join("user:" + user.id);
			if (!user.channelSubscribed) {
				// console.log("failed to join to all subscribed channels");
				return;
			}
			// console.log("joining to all subscribed channels");
			for (var i = 0; i < user.channelSubscribed.length; i++) {
				// client.join("channel:" + user.channelSubscribed[i].id);
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
	async joinChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string
	): Promise<{channel_id: string, success: boolean, reason: string}> {
		console.log("join channel event", channel_id);
		const user = await this.userFromSocket(client);
		if (!user) {
			return {channel_id: channel_id, success: false, reason: "user not found"};
		}
		console.log("user:", user);
		const channel = await this.channelService.findOne(channel_id);
		if (!channel) {
			return {channel_id: channel_id, success: false, reason: "channel not found"};
		}
		// if (user.userName == "zach")
		// 	return {channel_id: channel_id, success: false, reason: "zach is not allowed"};

		//TODO: check if user is subscribed to channel otherwise not allowed, currently no way to do it
		const is_subscribed = true;
		if (!is_subscribed) {
			return {channel_id: channel_id, success: false, reason: "not subscribed"};
		}

		//TODO: check if user is banned from channel otherwise not allowed, currently no way to do it
		const is_banned = false;
		if (is_banned) {
			return {channel_id: channel_id, success: false, reason: "banned"};
		}

		client.join("channel:" + channel_id);
		this.server.to("channel:" + channel_id).emit("join", { channel: channel_id, content: user.userName + " has joined the channel" });
		return {channel_id: channel_id, success: true, reason: "Success"};
	}

	//TODO: implement kick
	@UseGuards(WsGuard)
	@SubscribeMessage('kick')
	kickUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") user_id: string
	): void {
		console.log("kick event");
		this.server.to("user:" + user_id).emit("kick", channel_id );
		console.log("kick event end");
	}

	//TODO: implement leave
	@UseGuards(WsGuard)
	@SubscribeMessage('leave')
	leaveChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string
	): void {
		console.log("leave event");
		client.leave("channel:" + channel_id);
		this.userFromSocket(client).then(user => {
			this.server.to("user:" + user.id).emit("leave", channel_id );
		});
		console.log("leave event end");
	}

	//TODO: implement 
	@UseGuards(WsGuard)
	@SubscribeMessage('ban')
	banUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") user_id: string
	) {
		console.log("ban event");
		this.server.to("user:" + user_id).emit("ban", channel_id );
		console.log("ban event end");
	}

	//TODO: implement 
	@UseGuards(WsGuard)
	@SubscribeMessage('unban')
	unbanUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") user_id: string
	) {
		console.log("unban event");
		this.server.to("user:" + user_id).emit("unban", channel_id );
		console.log("unban event end");
	}

	//TODO: implement mute
	@UseGuards(WsGuard)
	@SubscribeMessage('mute')
	muteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") user_id: string
	) {
		console.log("mute event");
		this.server.to("user:" + user_id).emit("mute", channel_id );
		console.log("mute event end");
	}

	//TODO: implement unmute
	@UseGuards(WsGuard)
	@SubscribeMessage('unmute')
	unmuteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") user_id: string
	) {
		console.log("unmute event");
		this.server.to("user:" + user_id).emit("unmute", channel_id );
		console.log("unmute event end");
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

					//check if user is in channel and not muted

					this.messageService.createMessage(channel, user, message).then((m) => {
						console.log("sending message");
						this.server.to("channel:" + channel_id).emit("message", {channel: channel_id, sender: m.author.userName, sender_id: m.author.id, content: m.content, date: m.date});
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