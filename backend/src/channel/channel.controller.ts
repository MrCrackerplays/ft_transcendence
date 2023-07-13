import { Controller, Param, Get } from "@nestjs/common";

import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { Message } from "src/channel/message/message.entity";


@Controller('channels')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	// Gets all public channels
	@Get()
	async getAllPublic(): Promise<any[]> {
		return this.channelService.getAllPublic();
	}

	// !: DEBUG
	// @Get('id/:idn')
	// async findOne(@Param('idn') id: string): Promise<Channel> {
	// 	return this.channelService.findOne(id);
	// }

	// @Get(':name')
	// async findFromName(@Param('name') name: string): Promise<PublicChannel> {
	// 	return this.channelService.findFromName(name);
	// }

	@Get(':id/messages')
	async findAllMessages(@Param('id') id: string): Promise<Message[]> {
		return this.channelService.findAllMessages(id);
	}

	// @Post(':id/messages')
	// async createMessage(@Param('id') id: string, @Body() createMessageDTO: CreateMessageDTO): Promise<Channel> {
	// 	const channel = await this.channelService.findOne(id);
	// 	return this.channelService.createMessage(channel, createMessageDTO);
	// }

	// !: DEBUG
	// @Get(':id/delete')
	// removeOne(@Param('id') id: string): Promise<void> {
	// 	return this.channelService.removeOne(id);
	// }
}
