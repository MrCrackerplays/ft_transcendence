import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChannelService } from "./channel.service";
import { Channel } from "./channel.entity";
import { ChannelController } from "./channel.controller";
import { MessageService } from "src/channel/message/message.service";
import { Message } from "src/channel/message/message.entity";

@Module({
	imports: [ TypeOrmModule.forFeature([Channel, Message]) ],
	providers: [ ChannelService, MessageService ],
	controllers: [ ChannelController ],
	exports: [ ChannelService ]
})
export class ChannelModule {}
