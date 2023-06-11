import { Module } from "@nestjs/common";
import { FriendListGateway } from "./friendlist.gateway";
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
	providers: [FriendListGateway, JwtService, ConnectionService, UserService],
})
export class FriendListModule {}
