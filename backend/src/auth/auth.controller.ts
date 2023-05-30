import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { Constants } from "../../../shared/constants";
import { AuthService } from "./auth.service";
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
	// SignIn is the process of logging in and getting the JWT token (in a cookie)
	async signIn(@Req() req: any, @Res() res: Response): Promise<void> {
		const conn: Connection = await this.authService.signIn(req.user as any);

		// Check if 2FA is enabled, if so the redirect is different
		let otp : boolean = true;
		let redirectURL = Constants.FRONTEND_LOGIN_REDIRECT;
		if (conn.otpSecret) {
			redirectURL = Constants.FRONTEND_OTP_REDIRECT;
			otp = false;
		}

		let finished = true;
		console.log(`username: ${conn.user.userName}`);
		if (!conn.user.userName) {
			redirectURL = Constants.FRONTEND_SETUP_REDIRECT;
			finished = false;
		}
		
		const cookie: string = this.authService.buildCookie(conn, otp, finished);

		res.setHeader('Set-Cookie', cookie);
		res.status(302);
		res.redirect(redirectURL);
	}

	@Public()
	@Post('setup')
	// Profile setup, to make sure user's set their profile name before being validated
	async signInSetup(@Req() req: AuthRequest, @Body('name') name : string, @Res() res: Response): Promise<void> {
		const conn: Connection = await this.authService.signInSetup(req, name);

		if (conn == null)
			throw new HttpException('User or username invalid', HttpStatus.NOT_ACCEPTABLE);

		// name changed?
		const cookie: string = this.authService.buildCookie(conn, true, true);

		res.setHeader('Set-Cookie', cookie);
		res.status(200).send();
	}

	@Public()
	@Post('loginOTP')
	// This signin is for when the user has enabled 2FA. it requires posting the 2FA code
	async signInOTP(@Req() req: AuthRequest, @Body('code') code : string, @Res() res: Response): Promise<void> {
		const conn: Connection = await this.authService.signInOTP(req, code);

		if (!conn) {
			res.status(HttpStatus.FORBIDDEN).send('Invalid');
			return ;
		}

		let finished = false;
		if (conn.user.userName.length > 0)
			finished = true;

		const cookie: string = this.authService.buildCookie(conn, true, finished);

		res.setHeader('Set-Cookie', cookie);
		res.status(200).send();
	}

	// !: DEBUG ONLY
	@Public()
	@Get('loginOTP/:code')
	async signInOTPParam(@Req() req: AuthRequest, @Param('code') code: string, @Res() res: Response): Promise<void> {
		this.signInOTP(req, code, res);
	}

	/* LOGOUT will NOT be implemented
	
	"A JWT is self-contained and is not designed to be invalidated, it will be valid until it expires."

	JWT tokens are not meant to be revoked or used to replace 'Sessions'

	Users can 'log out' by removing the cookie

	@Get('logout')
	async signOut(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
		this.authService.signOut(req);

		res.setHeader('Set-Cookie', ''); // Remove cookie
		res.status(302).redirect(Constants.FRONTEND_LOGIN_REDIRECT);
	}
	*/

	@Get('2fa')
	// Returns an QRcode image code thingy and enables 2FA
	// !: if the user doesn't scan the QR at this point their account is locked!
	async enableTwoFactor(@Req() req: AuthRequest, @Res() res: Response): Promise<string> {
		const qrcode = await this.authService.enableTwoFactor(req);

		const conn: Connection = await this.authService.getCurrentConnection(req);
		// Cookie needs to be updated (otp = false; because with a new OTP it'll never be validated at this point)
		const cookie: string = this.authService.buildCookie(conn, false, true);

		res.setHeader('Set-Cookie', cookie);
		res.json({ qr: qrcode });
		return qrcode;
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
	async disableTwoFactor(@Param('id') _id: number, @Res() res: Response) {
		const conn: Connection = await this.connectionService.get({id: _id});

		await this.authService.disableTwoFactor(conn);

		// Cookie needs to be updated, true because OTP is disabled
		const cookie: string = this.authService.buildCookie(conn, true, true);

		res.setHeader('Set-Cookie', cookie);
		res.status(200).send('2fa disabled (DEBUG ONLY)');
	}
}
