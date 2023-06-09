import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./controllers/user.controller";
import { ConnectionService } from "src/auth/connection/connection.service";
import { Connection } from "src/auth/connection/connection.entity";
import { SelfController } from "./controllers/self.controller";
import { IDController } from "./controllers/id.controller";
import { ChannelModule } from "src/channel/channel.module";
import { AchievementModule } from "src/achievements/achievement.module";
import { MatchModule } from "src/matches/match.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Connection]),
		ChannelModule,
		AchievementModule,
		MatchModule
	],
	providers: [ UserService, ConnectionService ],
	controllers: [ UserController, SelfController, IDController],
	exports: [
		TypeOrmModule.forFeature([User, Connection]),
		UserService,
		ConnectionService,
		ChannelModule,
		AchievementModule,
		MatchModule
	]
})
export class UserModule {}
