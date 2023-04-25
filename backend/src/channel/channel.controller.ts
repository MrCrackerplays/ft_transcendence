import { Controller, Param, ParseIntPipe, Get, Post, Delete, Body } from "@nestjs/common";

import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { CreateChannelDTO } from "../../../shared/dto/create-channel.dto";
import { PublicChannel } from "../../../shared/public-channel";
import { Message } from "src/message/message.entity";
import { CreateMessageDTO } from "../../../shared/dto/create-message.dto";


@Controller('channels')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	// TODO: obviously should be behind some security
	@Post()
	async createOne(@Body() createChannelDTO: CreateChannelDTO) {
		return this.channelService.createOne(createChannelDTO);
	}

	@Get()
	async findAll(): Promise<PublicChannel[]> {
		return this.channelService.findAll();
	}

	//? TEMPORARY
	@Get('id/:idn')
	async findOne(@Param('idn') id: string): Promise<Channel> {
		return this.channelService.findOne(id);
	}

	//? Should this be behind security?
	@Get(':name')
	async findFromName(@Param('name') name: string): Promise<PublicChannel> {
		return this.channelService.findFromName(name);
	}

	@Get(':id/messages')
	async findAllMessages(@Param('id') id: string): Promise<Message[]> {
		return this.channelService.findAllMessages(id);
	}

	@Post(':id/messages')
	async createMessage(@Param('id') id: string, @Body() createMessageDTO: CreateMessageDTO): Promise<Channel> {
		const channel = await this.channelService.findOne(id);
		return this.channelService.createMessage(channel, createMessageDTO);
	}

	// TODO: Obviously should be behind some security
	@Delete(':id')
	removeOne(@Param('id') id: string): Promise<void> {
		return this.channelService.removeOne(id);
	}
}
