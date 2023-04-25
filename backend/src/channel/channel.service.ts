import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateChannelDTO } from "../../../shared/dto/create-channel.dto";
import { CreateMessageDTO } from "../../../shared/dto/create-message.dto";
import { Channel } from "./channel.entity";
import { UserService } from "src/users/user.service";
import { PublicChannel } from "../../../shared/public-channel";
import { Message } from "src/message/message.entity";
import { MessageService } from "src/message/message.service";

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>,
		private readonly userService: UserService,
		private readonly messageService: MessageService
		) { }

	async createOne(createChannelDTO: CreateChannelDTO) {
		const channel = new Channel();
		channel.name = createChannelDTO.name;
		channel.messages = [];

		channel.owner = await this.userService.findOne(createChannelDTO.ownerID);

		return this.channelRepository.save(channel);
	}

	async findAll(): Promise<PublicChannel[]> {
		const query = {
			select : {
				id: true,
				name: true,
				visibility: true
			}
		};
		return this.channelRepository.find(query) as Promise<PublicChannel[]>;
	}

	findFromName(name: string): Promise<PublicChannel | null> {
		const query = {
			select : {
				id: true,
				name: true,
				visibility: true
			},
			where : {
				name: name
			}
		};
		return this.channelRepository.findOne(query) as Promise<PublicChannel | null>;
	}

	async findAllMessages(channelID: string): Promise<Message[]> {
		return this.messageService.getWithChannelID(channelID) as Promise<Message[]>;
	}

	async createMessage(channel: Channel, createMessageDTO: CreateMessageDTO): Promise<Channel> {
		const user = await this.userService.findOne(createMessageDTO.authorID);
		const msg = await this.messageService.createMessage(channel, user, createMessageDTO.content);
		await user.save();
		await msg.save();
		return channel.save();
		// return this.messageService.createMessage(channel, user, createMessageDTO.content);
	}

	findOne(id: string): Promise<Channel | null> {
		return this.channelRepository.findOneBy({ id });
	}

	async removeOne(id: string): Promise<void> {
		await this.channelRepository.delete(id);
	}
}
