import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChannelService } from "./channel.service";
import { Channel } from "./channel.entity";
import { ChannelController } from "./channel.controller";
import { UserService } from "src/users/user.service";
import { UserModule } from "src/users/user.module";
import { User } from "src/users/user.entity";
import { MessageService } from "src/message/message.service";
import { Message } from "src/message/message.entity";

@Module({
	imports: [ TypeOrmModule.forFeature([Channel, User, Message]), UserModule ],
	providers: [ ChannelService, UserService, MessageService ],
	controllers: [ ChannelController ]
})
export class ChannelModule {}
