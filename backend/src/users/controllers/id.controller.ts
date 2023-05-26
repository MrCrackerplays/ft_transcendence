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

	// !: DEBUG only
	@Public()
	@Post()
	async createOne(@Body() createUserDTO: CreateUserDTO) {
		return this.userService.createOne(createUserDTO);
	}

	@Public()
	@Get()
	// Promises a list of users
	async findAll(): Promise<User[]> {
		return this.userService.findAll();
	}

	@Public()
	@Get(':idn')
	// Promises a single user found from id
	async getID(@Param('idn') idn: string): Promise<User> {
		return this.userService.getOne({id: idn});
	}

	@Public()
	@Get(':idn/friends')
	// Promises a single user found from id
	async getFriends(@Param('idn') idn: string): Promise<User[]> {
		const user = await this.userService.getOne({id: idn});
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		return this.userService.getFriends(user);
	}

	@Public()
	@Post(':idn/friends')
	// Promises a single user found from id
	async addFriend(@Param('idn') idn: string, @Body() friend : any): Promise<void> {
		const user = await this.userService.getOne({id: idn});
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		return this.userService.addFriend(user, friend.id as string);
	}

	@Public()
	@Post(':idn/changename')
	// Promises a single user found from id
	async setName(@Param('idn') idn: string, @Body() name : any): Promise<User> {
		const user = await this.userService.getOne({id: idn});
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		return this.userService.setName(user, name.name as string);
	}

	@Public()
	@Post(':idn/achievements')
	// Promises a single user found from id
	// body: { id: number }
	async addAchievements(@Param('idn') idn: string, @Body() achievement : any): Promise<User> {
		const user = await this.userService.getOne({id: idn});
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		return this.userService.addAchievement(user, achievement.id);
	}

	// !: DEBUG only
	@Public()
	@Delete(':id')
	// Delete a single user found from id
	removeOne(@Param('id') id: string): Promise<void> {
		return this.userService.removeOne(id);
	}
}
