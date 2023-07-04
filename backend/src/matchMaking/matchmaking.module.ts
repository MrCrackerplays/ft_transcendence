import { Module } from "@nestjs/common";
import { MatchMakingGateway } from "./matchmaking.gateway";

import { UserModule } from "src/users/user.module";
import { AuthModule } from "src/auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from 'src/auth/auth.service';

@Module({
	imports: [
		AuthModule,
		UserModule
	],
	providers: [MatchMakingGateway, JwtService, AuthService],
})
export class MatchMakingModule {}