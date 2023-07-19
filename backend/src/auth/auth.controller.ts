import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { Constants } from "../../../shared/constants";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { AuthGuard42 } from "./guards/auth42.guard";
import { Connection } from "./connection/connection.entity";
import { AuthRequest } from "src/auth/interfaces/authrequest.interface";
import { ConnectionService } from "./connection/connection.service";

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
		const conn: Connection = await this.authService.signIn(req.user);

		if (!conn) {
			console.log('Bad payload, unauthorized user!');
			res.status(HttpStatus.FORBIDDEN).send();
			req.redirect(`${Constants.FRONTEND_URL}/login`);
			return ;
		}

		// Check if 2FA is enabled, if so the redirect is different
		let otp : boolean = true;
		let redirectURL = Constants.FRONTEND_LOGIN_REDIRECT;
		if (conn.otpSecret) {
			redirectURL = Constants.FRONTEND_OTP_REDIRECT;
			otp = false;
		}

		let finished = true;
		if (!conn.user.userName) {
			redirectURL = Constants.FRONTEND_SETUP_REDIRECT;
			finished = false;
		}
		
		const cookie: string = this.authService.signAndGetCookie(conn, otp, finished);

		res.setHeader('Set-Cookie', cookie)
			.status(302)
			.redirect(redirectURL);
	}

	@Get('logout')
	async logOut(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
		res.clearCookie('Authentication', {domain: Constants.FRONTEND_HOST, httpOnly: true, path: '/' })
			.status(200)
			.redirect(`${Constants.FRONTEND_URL}/login`);
	}

	@Public()
	@Post('setup')
	// Profile setup, to make sure user's set their profile name before being validated
	async signInSetup(@Req() req: AuthRequest, @Body('name') name : string, @Res() res: Response): Promise<void> {
		const conn: Connection = await this.authService.signInSetup(req, name);

		if (conn == null)
			throw new HttpException('User or username invalid', HttpStatus.NOT_ACCEPTABLE);

		// name changed?
		const cookie: string = this.authService.signAndGetCookie(conn, true, true);

		res.setHeader('Set-Cookie', cookie)
			.status(200)
			.send();
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

		const cookie: string = this.authService.signAndGetCookie(conn, true, true);

		res.setHeader('Set-Cookie', cookie)
			.status(200)
			.send();
	}

	@Get('2fa')
	// Returns an QRcode image code thingy and enables 2FA
	// !: if the user doesn't scan the QR at this point their account is locked!
	async enableTwoFactor(@Req() req: AuthRequest, @Res() res: Response): Promise<string> {
		const qrcode = await this.authService.enableTwoFactor(req);

		if (qrcode == null) {
			res.status(HttpStatus.CONFLICT).send('2FA already enabled');
		}

		const conn: Connection = await this.authService.getCurrentConnection(req);
		
		// // Should cookie be updated with otp = false?
		// const cookie: string = this.authService.signAndGetCookie(conn, false, true);

		res.json({ qr: qrcode });
		return qrcode;
	}

	@Post('2fa/validate')
	async validateTwoFactor(@Req() req: AuthRequest, @Body('code') code: string, @Res() res: Response): Promise<void> {
		var conn: Connection = await this.authService.getCurrentConnection(req);
		if (!conn)
			res.status(HttpStatus.FORBIDDEN).send();

		conn = await this.authService.validateTwoFactor(conn.id, code);
		if (conn != null) {
			// now build a cookie with 2FA actually enabled
			const cookie: string = this.authService.signAndGetCookie(conn, true, true);
			res.setHeader('Set-Cookie', cookie)
				.status(200)
				.send();
			return ;
		}
		res.status(HttpStatus.FORBIDDEN).send();
	}

	@Get('2fa/enabled')
	async getTwoFactor(@Req() req: AuthRequest): Promise<boolean> {
		return this.authService.getTwoFactorEnabled(req);
	}

	@Post('2fa/disable')
	async disable2FA(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
		const conn: Connection = await this.authService.getCurrentConnection(req);

		this.authService.disableTwoFactor(conn);

		// Cookie needs to be updated, true because OTP is disabled
		const cookie: string = this.authService.signAndGetCookie(conn, true, true);

		res.setHeader('Set-Cookie', cookie)
			.status(200)
			.send('2fa disabled');
	}
}
