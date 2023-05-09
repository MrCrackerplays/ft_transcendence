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

@Module({
	imports: [ TypeOrmModule.forFeature([User, Connection, Match]) ],
	providers: [ UserService, AuthService, ConnectionService ],
	controllers: [ UserController, SelfController ],
	exports: [ UserService ]
})
export class UserModule {}
