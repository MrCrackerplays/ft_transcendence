require("dotenv").config();
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: 'http://localhost:5173',
		credentials: true
	});
	app.use(cookieParser());
	await app.listen(3000);
}
bootstrap();
