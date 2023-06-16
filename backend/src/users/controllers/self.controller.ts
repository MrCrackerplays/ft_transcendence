import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "../user.service";
import { AuthRequest } from "src/auth/interfaces/authrequest.interface";
import { User } from "../user.entity";
import { Match } from "src/matches/match.entity";
import { Channel } from "src/channel/channel.entity";
import { Message } from "src/channel/message/message.entity";
import { Achievement } from "src/achievements/achievement.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { STORAGE_DEFAULT_IMAGE, STORAGE_IMAGE_LOCATION, storage } from "src/storage";
import { Response } from "express";
import { join } from "path";
import { CreateChannelDTO } from "../../../../shared/dto/channel.dto";
import { CreateMessageDTO } from "../../../../shared/dto/create-message.dto";
import { SubscribeToChannelDTO } from "../../../../shared/dto/subscribe-channel.dto";

@Controller('self')
export class SelfController {
	constructor(
		private readonly userService: UserService
		) {}

	@Get()
	async get(@Req() req: AuthRequest): Promise<User> {
		return (this.userService.getCurrentUser(req));
	}

	@Get('matches')
	async getRecentMatches(@Req() req: AuthRequest): Promise<Match[]> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.getRecentMatches(currentUser);
	}

	@Get('friends')
	async getFriends(@Req() req: AuthRequest): Promise<User[]> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.getFriends(currentUser);
	}

	@Post('friends')
	async addFriend(@Req() req: AuthRequest, @Body() friend : any): Promise<void> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.addFriend(currentUser, friend.id as string);
	}

	@Delete('friends')
	async removeFriend(@Req() req: AuthRequest, @Body() friend : any): Promise<void> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.removeFriend(currentUser, friend.id as string);
	}

	@Get('channels')
	async getChannels(@Req() req: AuthRequest): Promise<Channel[]> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.getChannels(currentUser);
	}

	@Post('subscribe')
	async subscribeToChannel(@Req() req: AuthRequest, @Body() dto: SubscribeToChannelDTO): Promise<Channel> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.subscribeToChannel(currentUser, dto)
	}

	@Post('channels')
	async createChannel(@Req() req: AuthRequest, @Body() dto: CreateChannelDTO): Promise<Channel> {
		const currentUser = await this.getCurrentUser(req);		
		return this.userService.createChannel(currentUser, dto);
	}

	@Get('channels/:idn/messages')
	async getChannelMessages(@Req() req: AuthRequest, @Param('idn') channelID: string): Promise<Message[]> {
		const currentUser = await this.getCurrentUser(req);	
		return this.userService.getChannelMessages(channelID, currentUser);
	}

	@Post('channels/:idn/messages')
	async createChannelMessage(@Req() req: AuthRequest, @Param('idn') channelID: string, @Body() dto: CreateMessageDTO): Promise<Message> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.createChannelMessage(channelID, currentUser, dto);
	}

	@Post('channels/:idn/password')
	async setChannelPassword(@Req() req: AuthRequest, @Param('idn') channelID: string, @Body() pw: any): Promise<void> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.setChannelPassword(channelID, currentUser, pw.password);
	}

	@Get('messages')
	async getMessages(@Req() req: AuthRequest): Promise<Message[]> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.getMessages(currentUser);
	}

	@Post('changename')
	// { "name": "<NAME>" }
	async setName(@Req() req: AuthRequest, @Body() nameDTO : any): Promise<User> {
		const currentUser = await this.getCurrentUser(req);
		if (!nameDTO || !nameDTO.name)
			throw new HttpException('No name provided', HttpStatus.NOT_ACCEPTABLE);

		const user = await this.userService.setName(currentUser, nameDTO.name);
		if (user == null)
			throw new HttpException('Username can not be accepted', HttpStatus.NOT_ACCEPTABLE);
		return user;
	}

	@Get('achievements')
	async getAchievements(@Req() req: AuthRequest): Promise<Achievement[]> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.getAchievements(currentUser);
	}

	@Post('pfp')
	@UseInterceptors(FileInterceptor('file', storage))
	async uploadProfilePicture(@Req() req: AuthRequest, @UploadedFile() file : Express.Multer.File): Promise<User> {
		const currentUser = await this.getCurrentUser(req);

		return this.userService.setProfilePicture(currentUser, file);
	}

	@Get('pfp')
	async getProfilePicture(@Req() req: AuthRequest, @Res() res: Response): Promise<any> {
		const currentUser = await this.getCurrentUser(req);

		if (!currentUser.imageURL) {
			// DEFAILT IMAGE!
			return res.sendFile(join(process.cwd(), STORAGE_DEFAULT_IMAGE));
		}
		return res.sendFile(join(process.cwd(), STORAGE_IMAGE_LOCATION + '/' + currentUser.imageURL));
	}

	@Get('block')
	async getBlocked(@Req() req: AuthRequest): Promise<User[]> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.getBlocked(currentUser);
	}

	@Post('block')
	async block(@Req() req: AuthRequest, @Body() blockee : any): Promise<void> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.block(currentUser, blockee.id as string);
	}

	@Post('unblock')
	async unblock(@Req() req: AuthRequest, @Body() blockee : any): Promise<void> {
		const currentUser = await this.getCurrentUser(req);
		return this.userService.unblock(currentUser, blockee.id as string);
	}

	// ====== HELPERS =======
	async getCurrentUser(req: AuthRequest): Promise<User> {
		const currentUser = await this.get(req);
		if (!currentUser)
			throw new HttpException('No current user', HttpStatus.FORBIDDEN);
		return currentUser;
	}

}
