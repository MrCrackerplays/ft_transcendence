import { Controller, Get, HttpException, HttpStatus, Req } from "@nestjs/common";
import { UserService } from "../user.service";
import { ConnectionService } from "src/auth/connection.service";
import { AuthRequest } from "src/interfaces/authrequest.interface";
import { User } from "../user.entity";
import { Match } from "src/matches/match.entity";

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
		const currentUser = await this.get(req);
		if (!currentUser)
			throw new HttpException('No current user', HttpStatus.FORBIDDEN);
		
		return this.userService.getRecentMatches(currentUser);
	}

}
