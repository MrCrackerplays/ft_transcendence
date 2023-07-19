import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { CreateChannelDTO, Visibility } from "../../../shared/dto/channel.dto";
import { CreateMessageDTO } from "../../../shared/dto/create-message.dto";
import { Channel } from "./channel.entity";
import { Message } from "src/channel/message/message.entity";
import { MessageService } from "src/channel/message/message.service";
import { User } from "src/users/user.entity";
import { PublicChannel } from "./public-channel.interface";
import { genSalt, hash } from "bcrypt";

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>,
		private readonly messageService: MessageService
	) { }
	static firsttime: boolean = true;
	
	async onApplicationBootstrap() {
		if (!ChannelService.firsttime)
			return ;
		ChannelService.firsttime = false;
		const globalChannel = await this.get({ name: 'Codam'});
		if (!globalChannel) {
			const newGlobalChannel = await this.create(null, {
				name: 'Codam',
				visibility: Visibility.PUBLIC,
				password: null
			})
			// if (newGlobalChannel) {
			// 	const msg = new Message();
			// 	msg.author = null;
			// 	msg.channel = newGlobalChannel;
			// 	msg.content = 'Welcome to Codam!';
			// 	msg.save();
			// 	newGlobalChannel.messages.push(msg);
			// }
			newGlobalChannel.save();
		}
	}

	async create(owner: User, dto: CreateChannelDTO): Promise<Channel> {
		const channel = new Channel();
		channel.name = dto.name;
		channel.messages = [];
		channel.visibility = dto.visibility;
		channel.password = dto.password ? await hash(dto.password, await genSalt()) : dto.password;
		channel.owner = owner;
		channel.members = [ owner ];
		channel.admins = [];
		channel.banned = [];
		channel.muted = [];

		return channel.save();
	}

	async createDM(userA: User, userB: User): Promise<Channel> {

		// EXISTING DMs
		const existingDM: Channel[] = await this.channelRepository.find({
			relations : ['members'],
			where: {
				visibility: Visibility.DM,
				members: {
					id: userA.id
				}
			}
		});

		for (var c of existingDM) {
			// reload relation with BOTH participants
			c = await this.channelRepository.findOne({relations: ['members'], where: {id : c.id }});
			if (!c)
				break ;
			for (var m of c.members) {
				if (m.id == userB.id) {
					return c; // channel exists
				}
			}
		}

		// NEW DMs
		const channel = new Channel();
		channel.name = `${userA.userName} : ${userB.userName}`;
		channel.messages = [];
		channel.visibility = Visibility.DM;
		channel.owner = null;
		channel.password = null;
		channel.members = [ userA, userB ];

		return channel.save();
	}

	/* async createOne(createChannelDTO: CreateChannelDTO) {
		const channel = new Channel();
		channel.name = createChannelDTO.name;
		channel.messages = [];

		channel.owner = await this.userService.findOne(createChannelDTO.ownerID);

		return this.channelRepository.save(channel);
	} */

	async get(where: any, relations = [] as string[]): Promise<Channel> {
		const channel = await this.channelRepository.findOne({ where, relations });

		if (!channel)
			return null;

		// Strip password
		channel.password = null;
		return channel;
	}

	async getAllPublic(): Promise<PublicChannel[]> {
		const channels = await this.channelRepository.find({
			where: {
				visibility: Visibility.PUBLIC
			}
		});

		const pubChannels: PublicChannel[] = [];
		for (var c of channels) {
			pubChannels.push(c.toPublic());
		}

		return (pubChannels);
	}

	async findAllMessages(channelID: string): Promise<Message[]> {
		return this.messageService.getWithChannelID(channelID, 100) as Promise<Message[]>;
	}

	async createMessage(channel: Channel, author: User, createMessageDTO: CreateMessageDTO): Promise<Message> {
		const msg = await this.messageService.createMessage(channel, author, createMessageDTO.content);
		return msg.save();
	}

	async setPassword(channelID: string, user: User, new_password: string): Promise<void> {
		const channel = await this.channelRepository.findOne({
			relations: ['owner'],
			where : {
				id: channelID,
				owner: {
					id: user.id
				}
			}
		});

		if (!channel) {
			throw new HttpException('Not the owner of the channel', HttpStatus.UNAUTHORIZED);
		}

		if (channel.visibility != Visibility.PUBLIC) {
			throw new HttpException('Only public channels can have passwords', HttpStatus.UNAUTHORIZED);
		}

		channel.password = new_password;
		channel.save();
	}

	async getChannelProtected(channelID: string, user: User): Promise<PublicChannel> {
		const channel = await this.protectedChannel(channelID, user);

		if (!channel)
			throw new HttpException('Not part of channel', HttpStatus.UNAUTHORIZED);

		return channel.toPublic();
	}

	// This one first checks if user is subscribed to the channel before sending back messages
	async getMessagesProtected(channelID: string, user: User): Promise<Message[]> {
		const channel = await this.protectedChannel(channelID, user);

		if (!channel)
			throw new HttpException('Not part of channel', HttpStatus.UNAUTHORIZED);

		// Load the messages
		// TODO: Remove magic number
		return this.messageService.get({
				channel: {
					id: channelID
				}
			},
			['channel'],
			50);
	}

	async createMessageProtected(channelID: string, user: User, dto: CreateMessageDTO): Promise<Message> {
		const channel = await this.protectedChannel(channelID, user);

		if (!channel)
			throw new HttpException('Not part of channel', HttpStatus.UNAUTHORIZED);
		
		return this.createMessage(channel, user, dto);
	}

	findOne(id: string): Promise<Channel | null> {
		return this.channelRepository.findOneBy({ id });
	}

	findOneRelations(id: string, relations: string[] = []): Promise<Channel | null> {
		return this.channelRepository.findOne({ where: { id }, relations });
	}

	async removeOne(id: string): Promise<void> {
		await this.channelRepository.delete(id);
	}

	async protectedChannel(channelID: string, user: User): Promise<Channel | null> {
		const channel = await this.channelRepository.findOne({
			relations: ['members'],
			where : {
				id: channelID,
				members: {
					id: user.id
				}
			}
		});

		// Strip password
		channel.password = null;
		return channel;
	}
}
