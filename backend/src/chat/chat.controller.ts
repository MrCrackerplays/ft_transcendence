import { Controller, Get, Logger, Param, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { Constants } from "../../../shared/constants";
import { AuthRequest } from "src/auth/interfaces/authrequest.interface";
import { Connection } from "src/auth/connection/connection.entity";
import { AuthService } from "src/auth/auth.service";
import { UserService } from "src/users/user.service";

@Controller()
export class ChatController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) { }

	@Get("chat-invite/:id")
	async getChatInvite(@Req() req: AuthRequest, @Res() res: Response, @Param('id') _id: string): Promise<void> {
		const conn: Connection = await this.authService.getCurrentConnection(req);
		if (!conn) {
			res.redirect(`${Constants.FRONTEND_URL}/login`);
			return;
		}

		try {
			const channel = await this.userService.subscribeToChannel(conn.user, { channelID: _id, password: null });
			if (!channel) {
				Logger.log(`User ${conn.user.userName} tried to join channel ${_id} but failed`);
			}
		} catch (e) {
			Logger.log(`User ${conn.user.userName} tried to join channel ${_id} but it was an invalid uuid`);
		}
		res.redirect(`${Constants.FRONTEND_URL}/`);
	}
}
