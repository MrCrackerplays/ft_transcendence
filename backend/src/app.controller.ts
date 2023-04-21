import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	// TODO: default GET should return the frontend page?
	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
}
