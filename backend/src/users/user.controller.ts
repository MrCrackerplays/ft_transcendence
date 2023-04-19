import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDTO } from '../../../shared/dto/create-user.dto';
import { PublicUser } from '../../../shared/public-user';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async createOne(@Body() createUserDTO: CreateUserDTO) {
		return this.userService.createOne(createUserDTO);
	}

	@Get()
	// Promises a list of users
	async findAll(): Promise<PublicUser[]> {
		return this.userService.findAll();
	}

	//? TEMPORARY
	@Get('id/:idn')
	// Promises a single user found from id
	async findOne(@Param('idn', ParseIntPipe) id: number): Promise<User> {
		return this.userService.findOne(id);
	}

	@Get(':name')
	// Promises a single user found from username
	async findFromUsername(@Param('name') name: string): Promise<PublicUser> {
		return this.userService.findFromUsername(name);
	}

	@Delete(':id')
	// Delete a single user found from id
	removeOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.userService.removeOne(id);
	}
}
