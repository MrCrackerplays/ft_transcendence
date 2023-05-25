import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./controllers/user.controller";
import { AuthService } from "src/auth/auth.service";
import { ConnectionService } from "src/auth/connection.service";
import { Connection } from "src/auth/connection.entity";
import { SelfController } from "./controllers/self.controller";
import { Match } from "src/matches/match.entity";
import { IDController } from "./controllers/id.controller";
import { Achievement } from "src/achievements/achievement.entity";
import { ChannelModule } from "src/channel/channel.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Connection, Match, Achievement]),
		ChannelModule
	],
	providers: [ UserService, AuthService, ConnectionService ],
	controllers: [ UserController, SelfController, IDController],
	exports: [ UserService ]
})
export class UserModule {}
