import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { User } from "../users/user.entity";
import { Channel } from "src/channel/channel.entity";
import { Message } from "src/message/message.entity";
import { Match } from "src/matches/match.entity";
import { Connection } from "src/auth/connection.entity";

@Module({
	imports: [
		// TypeORM for databases
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('POSTGRES_HOST'),
				port: configService.get('POSTGRES_PORT'),
				username: configService.get('POSTGRES_USER'),
				password: configService.get('POSTGRES_PASSWORD'),
				database: configService.get('POSTGRES_DB'),
				entities: [
					User,
					Channel,
					Message,
					Match,
					Connection
				],
				synchronize: true
			})			
		})
	]
})
export class DatabaseModule {}
