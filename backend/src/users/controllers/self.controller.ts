import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "../user.service";
import { ConnectionService } from "src/auth/connection.service";
import { AuthRequest } from "src/interfaces/authrequest.interface";
import { User } from "../user.entity";
import { Match } from "src/matches/match.entity";
import { Channel } from "src/channel/channel.entity";
import { Message } from "src/message/message.entity";
import { Achievement } from "src/achievements/achievement.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { STORAGE_DEFAULT_IMAGE, STORAGE_IMAGE_LOCATION, storage } from "src/storage";
import { Response } from "express";
import { join } from "path";

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

	@Get('achievements')
	async getAchievements(@Req() req: AuthRequest): Promise<Achievement[]> {
		const currentUser = await this.getCurrrentUser(req);
		return this.userService.getAchievements(currentUser);
	}

	@Post('pfp')
	@UseInterceptors(FileInterceptor('file', storage))
	async uploadProfilePicture(@Req() req: AuthRequest, @UploadedFile() file : Express.Multer.File): Promise<User> {
		const currentUser = await this.getCurrrentUser(req);

		return this.userService.setProfilePicture(currentUser, file);
	}

	@Get('pfp')
	async getProfilePicture(@Req() req: AuthRequest, @Res() res: Response): Promise<any> {
		const currentUser = await this.getCurrrentUser(req);

		if (!currentUser.imageURL) {
			// DEFAILT IMAGE!
			return res.sendFile(join(process.cwd(), STORAGE_DEFAULT_IMAGE));
		}
		return res.sendFile(join(process.cwd(), STORAGE_IMAGE_LOCATION + currentUser.imageURL));
	}

	// ====== HELPERS =======
	async getCurrrentUser(req: AuthRequest): Promise<User> {
		const currentUser = await this.get(req);
		if (!currentUser)
			throw new HttpException('No current user', HttpStatus.FORBIDDEN);
		return currentUser;
	}

}
