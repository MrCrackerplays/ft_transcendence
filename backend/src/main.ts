require("dotenv").config();
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module';
import { Constants } from '../../shared/constants';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: `${Constants.FRONTEND_URL}`,
		credentials: true
	});
	app.use(cookieParser());
	await app.listen(3000);
}
bootstrap();
