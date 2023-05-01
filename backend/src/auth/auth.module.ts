import { Module } from "@nestjs/common";

import { UserModule } from "src/users/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { UserService } from "src/users/user.service";
import { ConnectionService } from "./connecton.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/user.entity";
import { Connection } from "./connection.entity";
import { PassportModule } from "@nestjs/passport";
import { Strategy42 } from "./strategies/strat42.strategy";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Connection]),
		AuthModule,
		UserModule,
		PassportModule,

		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '7d' }
		})
	],
	providers: [AuthService, UserService, ConnectionService, Strategy42],
	controllers: [AuthController]
})
export class AuthModule {}
