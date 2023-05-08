import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { Constants } from "../../../shared/constants";
import { AuthService } from "./auth.service";
import { User42 } from "./interfaces/user42.interface";
import { Public } from "./decorators/public.decorator";
import { AuthGuard42 } from "./guards/auth42.guard";
import { Connection } from "./connection.entity";

@Controller()
export class AuthController {
	constructor(private authService : AuthService) {}

	@Public()
	@UseGuards(AuthGuard42)
	@Get('login')
	// SignIn is the process of login in and getting the JWT token (in a cookie)
	async signIn(@Req() req: any, @Res() res: Response): Promise<void> {
		const connection: Connection = await this.authService.signIn(req.user as User42);

		const cookie: string = this.authService.buildCookie(connection);

		res.setHeader('Set-Cookie', cookie);
		res.status(302).redirect(Constants.FRONTEND_LOGIN_REDIRECT);
	}
}
