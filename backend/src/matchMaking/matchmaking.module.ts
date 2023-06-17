import { Module } from "@nestjs/common";
import { MatchMakingGateway } from "./matchmaking.gateway";

import { UserModule } from "src/users/user.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [
		AuthModule,
		UserModule
	],
	providers: [MatchMakingGateway],
})
export class MatchMakingModule {}