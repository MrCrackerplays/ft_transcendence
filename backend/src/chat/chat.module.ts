import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtService } from "@nestjs/jwt";

import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "src/auth/connection.entity";
import { ConnectionService } from 'src/auth/connection.service';

import { Message } from "src/message/message.entity";
import { MessageService } from 'src/message/message.service';

import { Channel } from 'src/channel/channel.entity';
import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';
import { Match } from 'src/matches/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Connection, Message,
    Channel, User, Match
  ])],
  providers: [ChatGateway, JwtService, ConnectionService, MessageService, 
    ChannelService,
    UserService
  ],
})
export class ChatModule {}