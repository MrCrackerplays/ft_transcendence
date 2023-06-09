import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { DatabaseModule } from './database/database.module';
import { ChannelModule } from './channel/channel.module';
import { MatchModule } from './matches/match.module';
import { AuthModule } from './auth/auth.module';
import { AchievementModule } from './achievements/achievement.module';

@Module({

	imports: [
		// Configuration from .env
		ConfigModule.forRoot({
			envFilePath: '.env',
			validationSchema: Joi.object({
				POSTGRES_HOST: 		Joi.string().required(),
				POSTGRES_PORT: 		Joi.number().required(),
				POSTGRES_USER: 		Joi.string().required(),
				POSTGRES_PASSWORD: 	Joi.string().required(),
				POSTGRES_DB: 		Joi.string().required(),

				JWT_SECRET: 		Joi.string().required(),
				ID42: 				Joi.string().required(),
				SECRET42: 			Joi.string().required(),
				CALLBACK42: 		Joi.string().required()
			})
		}),

		// Register all modules
		DatabaseModule,
		UserModule,
		ChannelModule,
		MatchModule,
		AuthModule,
		AchievementModule
	],

	controllers: [
		AppController
	],

	providers: [
		AppService
	]

})
export class AppModule {}
