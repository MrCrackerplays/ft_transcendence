import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { UserService } from '../user.service';
import { User } from '../user.entity';

import { CreateUserDTO } from '../../../../shared/dto/create-user.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { join } from 'path';
import { Response } from 'express';
import { STORAGE_DEFAULT_IMAGE, STORAGE_IMAGE_LOCATION } from 'src/storage';
import { Match } from 'src/matches/match.entity';

@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService
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

	@Get(':name/pfp')
	async getProfilePicture(@Param('name') name: string, @Res() res: Response): Promise<any> {
		const user : User = await this.userService.getOne({userName: name});

		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		if (!user.imageURL) {
			// DEFAULT IMAGE!
			return res.sendFile(join(process.cwd(), STORAGE_DEFAULT_IMAGE));
		}
		return res.sendFile(join(process.cwd(), STORAGE_IMAGE_LOCATION + '/' + user.imageURL));
	}

	@Get(':name/matches')
	async getRecentMatches(@Param('name') name: string): Promise<Match[]> {
		const user : User = await this.userService.getOne({userName: name});

		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);

		return this.userService.getRecentMatches(user);
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
