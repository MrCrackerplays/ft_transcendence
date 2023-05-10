import { Body, Controller, Get, HttpException, HttpStatus, Post, Req } from "@nestjs/common";
import { UserService } from "../user.service";
import { ConnectionService } from "src/auth/connection.service";
import { AuthRequest } from "src/interfaces/authrequest.interface";
import { User } from "../user.entity";
import { Match } from "src/matches/match.entity";
import { Channel } from "src/channel/channel.entity";
import { Message } from "src/message/message.entity";

@Controller('self')
export class SelfController {
	constructor(
		private readonly userService: UserService,
		private readonly connectionService: ConnectionService
		) {}

	@Get()
	async get(@Req() req: AuthRequest): Promise<User> {
		return (this.userService.getCurrentUser(req));
	}


	@Get('matches')
	async getRecentMatches(@Req() req: AuthRequest): Promise<Match[]> {
		const currentUser = await this.getCurrrentUser(req);
		return this.userService.getRecentMatches(currentUser);
	}

	@Get('friends')
	async getFriends(@Req() req: AuthRequest): Promise<User[]> {
		const currentUser = await this.getCurrrentUser(req);
		return this.userService.getFriends(currentUser);
	}

	@Post('friends')
	async addFriend(@Req() req: AuthRequest, @Body() friend : any): Promise<void> {
		const currentUser = await this.getCurrrentUser(req);
		return this.userService.addFriend(currentUser, friend.id as string);
	}

	@Get('channels')
	async getChannels(@Req() req: AuthRequest): Promise<Channel[]> {
		const currentUser = await this.getCurrrentUser(req);		
		return this.userService.getChannels(currentUser);
	}

	@Get('messages')
	async getMessages(@Req() req: AuthRequest): Promise<Message[]> {
		const currentUser = await this.getCurrrentUser(req);		
		return this.userService.getMessages(currentUser);
	}

	@Post('changename')
	// { "name": "<NAME>" }
	async setName(@Req() req: AuthRequest, @Body() nameDTO : any): Promise<User> {
		const currentUser = await this.getCurrrentUser(req);
		if (!nameDTO || !nameDTO.name)
			throw new HttpException('No name provided', HttpStatus.NOT_ACCEPTABLE);

		return this.userService.setName(currentUser, nameDTO.name);
	}

	// ====== HELPERS =======
	async getCurrrentUser(req: AuthRequest): Promise<User> {
		const currentUser = await this.get(req);
		if (!currentUser)
			throw new HttpException('No current user', HttpStatus.FORBIDDEN);
		return currentUser;
	}

}
