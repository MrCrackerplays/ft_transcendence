import { Module } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConnectionService } from "./connection.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/user.entity";
import { Connection } from "./connection.entity";
import { PassportModule } from "@nestjs/passport";
import { Strategy42 } from "./strategies/strat42.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { UserModule } from "src/users/user.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Connection]),
		AuthModule,
		PassportModule,
		UserModule,
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '7d' }
		})
	],
	providers: [
		AuthService,
		ConnectionService,
		Strategy42,
		JwtStrategy,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard
		}
	],
	controllers: [AuthController],
	exports: [ AuthService, ConnectionService ]
})
export class AuthModule {}
