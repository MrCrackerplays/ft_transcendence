import { Module } from "@nestjs/common";
import { UserStatusGateway } from "./UserStatus.gateway";
import { JwtService } from "@nestjs/jwt";

import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "src/auth/connection/connection.entity";
import { ConnectionService } from "src/auth/connection/connection.service";

import { User } from "src/users/user.entity";
import { UserService } from "src/users/user.service";
import { UserModule } from "src/users/user.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [
		AuthModule,
		UserModule
	],
	providers: [UserStatusGateway],
})
export class UserStatusModule {}
