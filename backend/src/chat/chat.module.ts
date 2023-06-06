import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtService } from "@nestjs/jwt";

import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "src/auth/connection/connection.entity";
import { ConnectionService } from 'src/auth/connection/connection.service';

import { Message } from 'src/channel/message/message.entity';
import { MessageService } from 'src/channel/message/message.service';

import { Channel } from 'src/channel/channel.entity';
import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';
import { Match } from 'src/matches/match.entity';
import { AchievementService } from 'src/achievements/achievement.service';
import { Achievement } from 'src/achievements/achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Connection, Message,
    Channel, User, Match,
    Achievement//only loaded because userservice got mad otherwise
  ])],
  providers: [ChatGateway, JwtService, ConnectionService, MessageService, 
    ChannelService,
    UserService,
    AchievementService//only loaded because userservice got mad otherwise
  ],
})
export class ChatModule {}