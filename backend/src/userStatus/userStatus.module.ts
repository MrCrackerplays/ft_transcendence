import { Module } from "@nestjs/common";
import { userStatusGateway } from "./userStatus.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/user.entity";
import { UserService } from "src/users/user.service";
import { Connection } from "src/auth/connection/connection.entity";
import { ConnectionService } from "src/auth/connection/connection.service";
import { JwtService } from "@nestjs/jwt";

@Module({
	imports: [
		TypeOrmModule.forFeature([Connection, User])
	],
	providers: [userStatusGateway, JwtService, ConnectionService, UserService],
})
export class UserStatusModule {}
