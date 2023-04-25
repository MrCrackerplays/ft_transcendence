import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { DataSource } from 'typeorm';
import { DatabaseModule } from './database/database.module';
import { ChannelModule } from './channel/channel.module';
import { MatchModule } from './matches/match.module';

@Module({

	imports: [
		// Configuration from .env
		ConfigModule.forRoot({
			envFilePath: '.env',
			validationSchema: Joi.object({
				POSTGRES_HOST: Joi.string().required(),
				POSTGRES_PORT: Joi.number().required(),
				POSTGRES_USER: Joi.string().required(),
				POSTGRES_PASSWORD: Joi.string().required(),
				POSTGRES_DB: Joi.string().required()
			})
		}),

		DatabaseModule,
		UserModule,
		ChannelModule,
		MatchModule
	],

	controllers: [
		AppController
	],

	providers: [
		AppService
	]

})
export class AppModule {}
