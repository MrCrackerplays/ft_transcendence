import { Logger, UseGuards } from '@nestjs/common';
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from "@nestjs/jwt";
import { ConnectionService } from 'src/auth/connection/connection.service';
import { MessageService } from 'src/channel/message/message.service';
import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/users/user.service';
import { WsGuard } from 'src/auth/guards/wsguard.guard';
import { User } from 'src/users/user.entity';
import { parse } from 'cookie';
import { CreateChannelDTO, Visibility } from '../../../shared/dto/channel.dto';


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
	constructor(
		private jwtService: JwtService,
		private connectionService: ConnectionService,
		private messageService: MessageService,
		private channelService: ChannelService,
		private userService: UserService,
		) { }

	private userFromSocket(socket: Socket, result?: any): Promise<User> | undefined {
		try {
			if (!result) {
				result = this.jwtService.verify(parse(socket.handshake.headers.cookie).Authentication, { secret: process.env.JWT_SECRET })
			}
			return this.connectionService.get({ id: result.id }).then(connection => {
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
		Logger.log(`new connection ${client.id}`);
		let result = undefined;
		try {
			result = this.jwtService.verify(parse(client.handshake.headers.cookie).Authentication, { secret: process.env.JWT_SECRET });
			if (!result)
				throw new Error("Invalid Token");
		} catch (e) {
			client.disconnect();
			return;
		}
		this.userFromSocket(client, result).then(user => {
			if (!user || !user.id) {
				client.disconnect();
				return;
			}
			client.join("user:" + user.id);

			this.userService.getChannels(user).then(channels => {
				channels.forEach(channel => {
					client.join("channel:" + channel.id);
					client.emit("join", channel.id);
				});
			});
		});
	}

	handleDisconnect(client: Socket) {
		Logger.log(`disconnected ${client.id}`);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('create')
	async createChannel(@ConnectedSocket() client: Socket, @MessageBody("name") name : string, @MessageBody("visibility") visibility : Visibility, @MessageBody("password") password : string
	): Promise<boolean> {
		const user = await this.userFromSocket(client);
		if (!user)
			return false;
		if (!name || !/^([a-zA-Z0-9_\-]{3,16})$/.test(name))
			return false;
		if (!password || password === "" || visibility == Visibility.PRIVATE)
			password = null;
		if (password && !/^([a-zA-Z0-9_\-]{3,16})$/.test(password))
			return false;
		if (visibility != Visibility.PUBLIC && visibility != Visibility.PRIVATE)
			return false;
			//TODO: add a method for creating dm's or allow them using this method
		let dto : CreateChannelDTO = { name: name, visibility: visibility, password: password };
		this.channelService.create(user, dto);
		return true;
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('delete')
	async deleteChannel(@ConnectedSocket() client: Socket, @MessageBody("channel") channel_id : string): Promise<boolean> {
		const user = await this.userFromSocket(client);
		if (!user)
			return false;
		const channel = await this.channelService.get({ id: channel_id });
		if (!channel || (channel.owner && channel.owner.id != user.id))
			return false;
		console.log("no deletion allowed yet, will crash")
		// this.server.to("channel:" + channel.id).emit("kick", { channel_id: channel.id });
		// this.server.to("channel:" + channel.id).socketsLeave("channel:" + channel.id);
		// this.channelService.removeOne(channel.id);
		return true;
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

		// let channels = await this.userService.getChannels(user);
		// console.log("channels:", channels);
		// const is_subscribed = (channels).includes(channel);
		// const is_subscribed = true;
		const is_subscribed = (await this.userService.getChannels(user)).filter(subscribed => subscribed.id == channel_id).length > 0;
		if (!is_subscribed) {
			console.log("user is not subscribed");
			// this.userService.subscribeToChannel(user, { channelID: channel_id, password: (await this.channelService.findOne(channel_id)).password });
			return {channel_id: channel_id, success: false, reason: "not subscribed"};
		}

		//TODO: check if user is banned from channel otherwise not allowed, currently no way to do it
		const is_banned = channel.banned.filter(banned => banned.id == user.id).length > 0;
		if (is_banned) {
			console.log("user is banned");
			return {channel_id: channel_id, success: false, reason: "banned"};
		}

		// client.join("channel:" + channel_id);
		this.server.in("user:" + user.id).socketsJoin("channel:" + channel_id);
		this.server.to("channel:" + channel_id).emit("joinmessage", { channel: channel_id, content: user.userName + " has joined the channel" });
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
		this.server.in("user:" + user_id).socketsLeave("channel:" + channel_id);
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
		// client.leave("channel:" + channel_id);
		this.userFromSocket(client).then(user => {
			this.server.to("user:" + user.id).emit("leave", channel_id );
			this.server.in("user:" + user.id).socketsLeave("channel:" + channel_id);
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
		this.server.in("user:" + user_id).socketsLeave("channel:" + channel_id);
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
}