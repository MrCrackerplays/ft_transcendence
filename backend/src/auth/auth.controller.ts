import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { Constants } from "../../../shared/constants";
import { AuthService } from "./auth.service";
import { User42 } from "./interfaces/user42.interface";
import { Public } from "./decorators/public.decorator";
import { AuthGuard42 } from "./guards/auth42.guard";
import { Connection } from "./connection.entity";
import { AuthRequest } from "src/interfaces/authrequest.interface";
import { ConnectionService } from "./connection.service";

@Controller()
export class AuthController {
	constructor(
		private authService : AuthService,
		private connectionService : ConnectionService) {}

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

	@Get('logout')
	async logout(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
		const conn = this.authService.getCurrentConnection(req);

		res.setHeader('Set-Cookie', ''); // Remove cookie
		res.status(302).redirect(Constants.FRONTEND_LOGIN_REDIRECT);
	}

	@Public()
	@Post('login/otp')
	async signInOTP(@Req() req: AuthRequest, @Body('code') code: string): Promise<string> {
		return this.authService.signInOTP(req, code);
	}

	@Public()
	@Get('login/otp/:code')
	async signInOTPParam(@Req() req: AuthRequest, @Param('code') code: string): Promise<string> {
		return this.authService.signInOTP(req, code);
	}

	// @Get('2fa/qr')
	// getQR(@Req() req: AuthRequest): Promise<string> {
	// 	return this.authService.generateQR(req.user.id);
	// }

	@Get('2fa')
	async enableTwoFactor(@Req() req: AuthRequest): Promise<string> {
		return this.authService.enableTwoFactor(req);
	}

	// @Post('2fa/validate')
	// async validateTwoFactor(@Req() req: AuthRequest, @Body('code') code: string): Promise<string> {
	// 	return this.authService.validateTwoFactor(req, code);
	// }

	@Get('2fa/enabled')
	async getTwoFactor(@Req() req: AuthRequest): Promise<boolean> {
		return this.authService.getTwoFactorEnabled(req);
	}

	// !: FOR DEBUG
	@Public()
	@Get('2fa/disable/:id')
	@HttpCode(200)
	async disableTwoFactor(@Param('id') _id: number) {
		const con : Connection = await this.connectionService.get({id: _id});
		if (!con)
			throw new HttpException('No Connection found', HttpStatus.NOT_FOUND);
		await this.authService.disableTwoFactor(con);
	}
}
