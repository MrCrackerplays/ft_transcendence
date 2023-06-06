import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { CreateChannelDTO, Visibility } from "../../../shared/dto/channel.dto";
import { CreateMessageDTO } from "../../../shared/dto/create-message.dto";
import { Channel } from "./channel.entity";
import { Message } from "src/channel/message/message.entity";
import { MessageService } from "src/channel/message/message.service";
import { User } from "src/users/user.entity";

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>,
		private readonly messageService: MessageService
		) {
			// Spawn global public channel
			this.init();
		}
	
	async init() {
		const globalChannel = await this.get({ name: 'Codam'});
		if (!globalChannel) {
			console.log('Creating Codam channel');
			const newGlobalChannel = await this.create(null, {
				name: 'Codam',
				visibility: Visibility.PUBLIC,
				password: null
			})
			if (newGlobalChannel) {
				console.log('Adding initial Codam welcome message');
				const msg = new Message();
				msg.author = null;
				msg.channel = newGlobalChannel;
				msg.content = 'Welcome to Codam!';
				msg.save();
				// newGlobalChannel.messages.push(msg);
				// newGlobalChannel.save();
			}
		}
	}

	async create(owner: User, dto: CreateChannelDTO): Promise<Channel> {
		const channel = new Channel();
		channel.name = dto.name;
		channel.messages = [];
		channel.visibility = dto.visibility;
		channel.password = dto.password;
		channel.owner = owner;
		channel.members = [ owner ];
		channel.save();

		// Strip password and return
		channel.password = null;
		return channel;
	}

	async createDM(userA: User, userB: User): Promise<Channel> {

		// EXISTING DMs
		const channelAlreadyExist = await this.channelRepository.findOne({
			relations : ['owner', 'members'],
			where: {
				visibility: Visibility.DM,
				owner: {
					id: In([userA.id, userB.id])
				},
				members: {
					id: In([userA.id, userB.id])
				}
			}
		});
		if (channelAlreadyExist != null)
			return (channelAlreadyExist);

		// NEW DMs
		const channel = new Channel();
		channel.name = `${userA.userName} : ${userB.userName}`;
		channel.messages = [];
		channel.visibility = Visibility.DM;
		channel.owner = userA;
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

	async getAllPublic(): Promise<Channel[]> {
		const channels = await this.channelRepository.find({
			where: {
				visibility: Visibility.PUBLIC
			}
		});

		// Strip passwords
		for (var c of channels) {
			c.password = null;
		}

		return (channels);
	}

	async findAllMessages(channelID: string): Promise<Message[]> {
		return this.messageService.getWithChannelID(channelID, 100) as Promise<Message[]>;
	}

	async createMessage(channel: Channel, author: User, createMessageDTO: CreateMessageDTO): Promise<Message> {
		const msg = await this.messageService.createMessage(channel, author, createMessageDTO.content);
		return msg.save();
	}

	// This one first checks if user is subscribed to the channel before sending back messages
	async getMessagesProtected(channelID: string, user: User): Promise<Message[]> {
		const channel = await this.channelRepository.findOne({
			relations: ['members'],
			where : {
				members: {
					id: user.id
				}
			}
		});

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
		const channel = await this.channelRepository.findOne({
			relations: ['members'],
			where : {
				members: {
					id: user.id
				}
			}
		});

		if (!channel)
			throw new HttpException('Not part of channel', HttpStatus.UNAUTHORIZED);
		
		return this.createMessage(channel, user, dto);
	}

	findOne(id: string): Promise<Channel | null> {
		return this.channelRepository.findOneBy({ id });
	}

	async removeOne(id: string): Promise<void> {
		await this.channelRepository.delete(id);
	}
}
