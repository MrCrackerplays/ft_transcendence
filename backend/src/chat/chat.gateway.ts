import { Logger, UseGuards } from '@nestjs/common';
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
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
import { Channel } from 'src/channel/channel.entity';
import { genSalt, hash } from 'bcrypt';

const CHANNEL_PASSWORD_REGEX = /^([a-zA-Z0-9_\-]{3,16})$/;

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

	private canDoAction(user: User, channel: Channel, action: string): boolean {
		console.log("user", user);
		console.log("channel", channel);
		if (channel.owner && channel.owner.id == user.id)
			return true;
		const is_admin: boolean = channel.admins && channel.admins.find(admin => admin.id == user.id) != undefined;
		const adminactions: string[] = [
			"kick",
			"ban",
			"unban",
			"mute",
			"unmute",
		];
		if (adminactions.includes(action)) {
			return is_admin;
		}
		const useractions: string[] = [
			"block",
			"unblock",
		];
		return useractions.includes(action);
	}

	private async getChannel(channel_id: string, relations: string[] = []): Promise<Channel> {
		try {
			const channel = await this.channelService.findOneRelations(channel_id, relations);
			if (!channel)
				return null;
			return channel;
		} catch (e) {
			return null;
		}
	}

	afterInit(server: Server): void {
		Logger.log('chat Server initialized');
	}

	handleConnection(client: Socket): void {
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

	handleDisconnect(client: Socket): void {
		Logger.log(`disconnected ${client.id}`);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('create')
	async createChannel(@ConnectedSocket() client: Socket, @MessageBody("name") name : string, @MessageBody("visibility") visibility : Visibility, @MessageBody("password") password : string
	): Promise<boolean> {
		const user = await this.userFromSocket(client);
		if (!user)
			return false;
		if (!name || !CHANNEL_PASSWORD_REGEX.test(name))
			return false;
		if (!password || password === "" || visibility == Visibility.PRIVATE)
			password = null;
		if (password && !CHANNEL_PASSWORD_REGEX.test(password))
			return false;
		if (visibility != Visibility.PUBLIC && visibility != Visibility.PRIVATE)
			return false;
			//TODO: add a method for creating dm's or allow them using this method
		let dto : CreateChannelDTO = { name: name, visibility: visibility, password: password };
		this.channelService.create(user, dto);
		return true;
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('updateChannel')
	async updateChannel(@ConnectedSocket() client: Socket, @MessageBody("channel") channel_id : string, @MessageBody("visibility") visibility : Visibility, @MessageBody("password") password : string
	): Promise<boolean> {
		const user = await this.userFromSocket(client);
		if (!user)
			return false;
		const channel = await this.getChannel(channel_id);
		if (!channel || !this.canDoAction(user, channel, "update"))
			return false;
		if (channel.visibility == Visibility.DM)
			return false;
		if (!password || password === "" || visibility == Visibility.PRIVATE)
			password = null;
		if (password && !CHANNEL_PASSWORD_REGEX.test(password))
			return false;
		if (visibility != Visibility.PUBLIC && visibility != Visibility.PRIVATE)
			return false;
		channel.visibility = visibility;
		channel.salt = await genSalt();
		channel.password = await hash(password, channel.salt);;
		channel.save();
		return true;
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('delete')
	async deleteChannel(@ConnectedSocket() client: Socket, @MessageBody("channel") channel_id : string): Promise<boolean> {
		const user = await this.userFromSocket(client);
		if (!user)
			return false;
		const channel = await this.getChannel(channel_id);
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

		const is_subscribed = (await this.userService.getChannels(user)).find(ch => ch.id == channel_id);
		if (!is_subscribed) {
			console.log("user is not subscribed");
			return {channel_id: channel_id, success: false, reason: "not subscribed"};
		}

		const is_banned = channel.banned.find(banned => banned.id == user.id);
		if (is_banned) {
			console.log("user is banned");
			return {channel_id: channel_id, success: false, reason: "banned"};
		}

		this.server.in("user:" + user.id).socketsJoin("channel:" + channel_id);
		this.server.to("channel:" + channel_id).emit("joinmessage", { channel: channel_id, content: user.userName + " has joined the channel" });
		return {channel_id: channel_id, success: true, reason: "Success"};
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('kick')
	kickUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.getChannel(channel_id, ['members']).then(channel => {
				if (!channel)
					return;
				console.log("kick event");
				if (this.canDoAction(user, channel, "kick") && channel.owner.id != target_user_id) {
					const is_owner = channel.owner.id == user.id;
					const is_admin = channel.admins.find(admin => admin.id == user.id) != undefined;
					const is_target_admin = channel.admins.find(admin => admin.id == target_user_id) != undefined;
					if (((is_owner || is_admin) && !is_target_admin) || (is_owner && is_target_admin)) {
						if (!channel.members) {
							Logger.error("channel has no members", "kickUser");
							return;
						}
						console.log("AAAAAAAA",channel.members);
						console.log("mien klomp", target_user_id, channel.members.filter(member => member.id != target_user_id));
						channel.members = channel.members.filter(member => member.id != target_user_id);
						console.log("BBBBBBBB",channel.members);
						channel.admins = channel.admins.filter(admin => admin.id != target_user_id);
						channel.save();
						console.log("CCCCCCCC",channel.members);
						this.server.to("user:" + target_user_id).emit("kick", channel_id );
						this.server.in("user:" + target_user_id).socketsLeave("channel:" + channel_id);
					}
				}
				console.log("kick event end");
			});
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('leave')
	leaveChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string
	): void {
		this.userFromSocket(client).then(user => {
			this.getChannel(channel_id, ['members']).then(channel => {
				console.log("leave event", channel, user);
				if (!channel)
					return;
				if (!channel.members) {
					Logger.error("channel has no members", "leaveChannel");
					return;
				}
				channel.members = channel.members.filter(member => member.id != user.id);
				channel.admins = channel.admins.filter(admin => admin.id != user.id);
				channel.save();
				this.server.to("user:" + user.id).emit("leave", channel_id );
				this.server.in("user:" + user.id).socketsLeave("channel:" + channel_id);
				console.log("leave event end");
			});
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('block')
	blockUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			console.log("block event");
			this.userService.get(target_user_id).then(target_user => {
				if (!target_user)
					return;
				user.blocked.push(target_user);
				user.save();
				this.server.to("user:" + user.id).emit("block", target_user_id );
			});
		});
		console.log("block event end");
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('unblock')
	unblockUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			console.log("unblock event");
			user.blocked = user.blocked.filter(blocked => blocked.id != target_user_id);
			user.save();
			this.server.to("user:" + user.id).emit("unblock", target_user_id );
		});
		console.log("unblock event end");
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('ban')
	banUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.getChannel(channel_id, ['members']).then(async channel => {
				if (!channel)
					return;
				console.log("ban event");
				if (this.canDoAction(user, channel, "ban") && channel.owner.id != target_user_id) {
					const is_owner = channel.owner.id == user.id;
					const is_admin = channel.admins.find(admin => admin.id == user.id) != undefined;
					const is_target_admin = channel.admins.find(admin => admin.id == target_user_id) != undefined;
					if (((is_owner || is_admin) && !is_target_admin) || (is_owner && is_target_admin)) {
						const target: User = await this.userService.findOne(target_user_id);
						if (!target)
							return;
						if (!channel.members) {
							Logger.error("channel has no members", "banUser");
							return;
						}
						channel.members = channel.members.filter(member => member.id != target_user_id);
						channel.admins = channel.admins.filter(admin => admin.id != target_user_id);
						channel.banned.push(target);
						channel.save();
						this.server.to("user:" + target_user_id).emit("ban", channel_id );
						this.server.in("user:" + target_user_id).socketsLeave("channel:" + channel_id);
					}
				}
				console.log("ban event end");
			});
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('unban')
	unbanUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.getChannel(channel_id, ['members']).then(async channel => {
				if (!channel)
					return;
				console.log("unban event");
				if (this.canDoAction(user, channel, "unban") && channel.owner.id != target_user_id) {
					const is_owner = channel.owner.id == user.id;
					const is_admin = channel.admins.find(admin => admin.id == user.id) != undefined;
					const is_target_admin = channel.admins.find(admin => admin.id == target_user_id) != undefined;
					if (((is_owner || is_admin) && !is_target_admin) || (is_owner && is_target_admin)) {
						const target: User = await this.userService.findOne(target_user_id);
						if (!target)
							return;
						channel.banned = channel.banned.filter(banned => banned.id != target.id);
						channel.save();
						this.server.to("user:" + target_user_id).emit("unban", channel_id );
					}
				}
				console.log("unban event end");
			});
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('mute')
	muteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.getChannel(channel_id).then(async channel => {
				if (!channel)
					return;
				console.log("mute event");
				if (this.canDoAction(user, channel, "mute") && channel.owner.id != target_user_id) {
					const is_owner = channel.owner.id == user.id;
					const is_admin = channel.admins.find(admin => admin.id == user.id) != undefined;
					const is_target_admin = channel.admins.find(admin => admin.id == target_user_id) != undefined;
					if (((is_owner || is_admin) && !is_target_admin) || (is_owner && is_target_admin)) {
						const target: User = await this.userService.findOne(target_user_id);
						if (!target)
							return;
						channel.muted.push(target);
						channel.save();
						this.server.to("user:" + target_user_id).emit("mute", channel_id );
					}
				}
				console.log("mute event end");
			});
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('unmute')
	unmuteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.getChannel(channel_id).then(async channel => {
				if (!channel)
					return;
				console.log("unmute event");
				if (this.canDoAction(user, channel, "unmute") && channel.owner.id != target_user_id) {
					const is_owner = channel.owner.id == user.id;
					const is_admin = channel.admins.find(admin => admin.id == user.id) != undefined;
					const is_target_admin = channel.admins.find(admin => admin.id == target_user_id) != undefined;
					if (((is_owner || is_admin) && !is_target_admin) || (is_owner && is_target_admin)) {
						const target: User = await this.userService.findOne(target_user_id);
						if (!target)
							return;
						channel.muted = channel.muted.filter(muted => muted.id != target.id);
						channel.save();
						this.server.to("user:" + target_user_id).emit("unmute", channel_id );
					}
				}
				console.log("unmute event end");
			});
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('promote')
	promoteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.getChannel(channel_id, ['members']).then(async channel => {
				if (!channel)
					return;
				console.log("promote event");
				if (this.canDoAction(user, channel, "promote") && channel.owner.id != target_user_id) {
					if (!channel.members) {
						Logger.error("channel has no members", "promoteUser");
						return;
					}
					if (!channel.members.find(member => member.id == target_user_id))
						return;
					const is_owner = channel.owner.id == user.id;
					const is_admin = channel.admins.find(admin => admin.id == user.id) != undefined;
					const is_target_admin = channel.admins.find(admin => admin.id == target_user_id) != undefined;
					if (((is_owner || is_admin) && !is_target_admin) || (is_owner && is_target_admin)) {
						const target: User = await this.userService.findOne(target_user_id);
						if (!target)
							return;
						channel.admins.push(target);
						channel.save();
						this.server.to("user:" + target_user_id).emit("promote", channel_id );
					}
				}
				console.log("promote event end");
			});
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('demote')
	demoteUser(
		@ConnectedSocket() client: Socket,
		@MessageBody("channel") channel_id: string,
		@MessageBody("user") target_user_id: string
	): void {
		this.userFromSocket(client).then(user => {
			if (!user)
				return;
			this.getChannel(channel_id).then(async channel => {
				if (!channel)
					return;
				console.log("demote event");
				if (this.canDoAction(user, channel, "demote") && channel.owner.id != target_user_id) {
					const is_owner = channel.owner.id == user.id;
					const is_admin = channel.admins.find(admin => admin.id == user.id) != undefined;
					const is_target_admin = channel.admins.find(admin => admin.id == target_user_id) != undefined;
					if (((is_owner || is_admin) && !is_target_admin) || (is_owner && is_target_admin)) {
						const target: User = await this.userService.findOne(target_user_id);
						if (!target)
							return;
						channel.admins = channel.admins.filter(admin => admin.id != target.id);
						channel.save();
						this.server.to("user:" + target_user_id).emit("demote", channel_id );
					}
				}
				console.log("demote event end");
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
				this.getChannel(channel_id, ['members']).then(channel => {
					if (!channel)
						return;

					if (!channel.members) {
						Logger.error("channel has no members", "message");
					} else if (!channel.members.find(member => member.id == user.id))
						return;
					if (channel.muted.find(muted => muted.id == user.id))
						return;

					this.messageService.createMessage(channel, user, message).then((m) => {
						console.log("sending message");
						this.server.to("channel:" + channel_id).emit("message", {channel: channel_id, sender: m.author.userName, sender_id: m.author.id, content: m.content, date: m.date});
						this.userService.unlockAchievement(user, "Send Message");
					});
				});
			});
		} catch (e) {
		}
	}
}