import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req } from '@nestjs/common';

import { UserService } from '../user.service';
import { User } from '../user.entity';
import { CreateUserDTO } from '../../../../shared/dto/create-user.dto';
import { Public } from 'src/auth/decorators/public.decorator';

// !: This is a controller made for DEBUGGING

@Controller('id/')
export class IDController {
	constructor(
		private readonly userService: UserService
		) {}
}
