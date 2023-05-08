import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthService } from "src/auth/auth.service";
import { ConnectionService } from "src/auth/connection.service";
import { Connection } from "src/auth/connection.entity";

@Module({
	imports: [ TypeOrmModule.forFeature([User, Connection]) ],
	providers: [ UserService, AuthService, ConnectionService ],
	controllers: [ UserController ],
	exports: [ UserService ]
})
export class UserModule {}
