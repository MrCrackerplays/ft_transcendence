import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from '../user.service';
import { User } from '../user.entity';

import { CreateUserDTO } from '../../../../shared/dto/create-user.dto';
import { AddFriendDTO } from '../../../../shared/dto/add-friend.dto';
import { PublicUser } from '../../../../shared/public-user';
import { PublicMatch } from '../../../../shared/public-match';
import { AuthService } from 'src/auth/auth.service';
import { AuthRequest } from 'src/interfaces/authrequest.interface';
import { ConnectionService } from 'src/auth/connection.service';
import { Connection } from 'src/auth/connection.entity';
import { Match } from 'src/matches/match.entity';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService,
		// private readonly connectionService: ConnectionService
		) {}

	// !: DEBUG only
	@Post()
	async createOne(@Body() createUserDTO: CreateUserDTO) {
		return this.userService.createOne(createUserDTO);
	}

	@Get()
	// Promises a list of users
	async findAll(): Promise<User[]> {
		return this.userService.findAll();
	}

	@Public()
	@Get(':name')
	// Promises a single user found from username
	async getFromUsername(@Param('name') name: string): Promise<User> {
		return this.userService.getOne({userName: name});
	}

	// @Get(':name/friends')
	// // Promises a single user found from username
	// async findFriends(@Param('name') name: string): Promise<PublicUser[]> {
	// 	const user: User = await this.userService.findFromUsername(name);
	// 	if (user == null)
	// 		return [];
	// 	return this.userService.getFriends(user);
	// }

	// @Post(':name/friends')
	// async addFriend(@Param('name') name: string, @Body() addFriendDTO: AddFriendDTO): Promise<void> {
	// 	const user: User = await this.userService.findFromUsername(name);
	// 	const friend: User = await this.userService.findOne(addFriendDTO.userID);
	// 	if (user == null || friend == null)
	// 		return ;
	// 	return this.userService.addFriend(user, friend.id);
	// }

	// @Get(':name/matches')
	// // Promises a single user found from username
	// async getRecentMatches(@Param('name') name: string): Promise<Match[]> {
	// 	const user: User = await this.userService.findFromUsername(name);
	// 	if (user == null)
	// 		return [];
	// 	return this.userService.getRecentMatches(user);
	// }
}
