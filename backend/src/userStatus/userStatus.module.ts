import { Module } from "@nestjs/common";
import { UserStatusGateway } from "./userStatus.gateway";

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
