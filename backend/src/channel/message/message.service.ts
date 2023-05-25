import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Message } from "./message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "src/channel/channel.entity";
import { User } from "src/users/user.entity";


@Injectable()
export class MessageService {
	constructor(@InjectRepository(Message) private messageRepository: Repository<Message>) { }
	
	async get(where: any, relations = [] as string[], count: number): Promise<Message[]> {
		const messages = this.messageRepository.find({where, relations, take: count});
		return messages;
	}

	async getWithChannelID(channelID: string, count: number): Promise<Message[]> {
		return await this.messageRepository.createQueryBuilder("message")
			.innerJoinAndSelect("message.channel", "channel")
			.where("channel.id = :channelID", { channelID })
			.take(count)
			.getMany();
	}

	createMessage(channel: Channel, user: User, content: string): Promise<Message> {
		const msg = new Message();
		msg.channel = channel;
		msg.author = user;
		msg.content = content;

		return this.messageRepository.save(msg);
	}
}