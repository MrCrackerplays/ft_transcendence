import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

import { CreateUserDTO } from '../../../shared/dto/create-user.dto';
import { AddFriendDTO } from '../../../shared/dto/add-friend.dto';
import { PublicUser } from '../../../shared/public-user';
import { PublicMatch } from '../../../shared/public-match';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	// TODO: obviously should be behind some security
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
	async findOne(@Param('idn') id: string): Promise<User> {
		return this.userService.findOne(id);
	}

	//? Should this be behind security?
	@Get(':name')
	// Promises a single user found from username
	async findFromUsername(@Param('name') name: string): Promise<PublicUser | null> {
		return this.userService.findFromUsername(name) as Promise<PublicUser | null>;
	}

	@Get(':name/friends')
	// Promises a single user found from username
	async findFriends(@Param('name') name: string): Promise<PublicUser[]> {
		const user: User = await this.userService.findFromUsername(name);
		if (user == null)
			return [];
		return this.userService.getFriends(user);
	}

	@Post(':name/friends')
	async addFriend(@Param('name') name: string, @Body() addFriendDTO: AddFriendDTO): Promise<void> {
		const user: User = await this.userService.findFromUsername(name);
		const friend: User = await this.userService.findOne(addFriendDTO.userID);
		if (user == null || friend == null)
			return ;
		return this.userService.addFriend(user, friend);
	}

	@Get(':name/matches')
	// Promises a single user found from username
	async getRecentMatches(@Param('name') name: string): Promise<PublicMatch[]> {
		const user: User = await this.userService.findFromUsername(name);
		if (user == null)
			return [];
		return this.userService.getRecentMatches(user);
	}

	// TODO: Obviously should be behind some security
	@Delete(':id')
	// Delete a single user found from id
	removeOne(@Param('id') id: string): Promise<void> {
		return this.userService.removeOne(id);
	}
}
