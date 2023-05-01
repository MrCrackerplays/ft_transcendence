import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { AuthService } from "./auth.service";
import { User42 } from "./interfaces/user42.interface";
import { Public } from "./decorators/public.decorator";
import { AuthGuard42 } from "./guards/auth42.guard";

@Controller()
export class AuthController {
	constructor(private authService : AuthService) {}

	@Public()
	@UseGuards(AuthGuard42)
	@Get('login')
	async signIn(@Req() req: any, @Res() res: Response): Promise<void> {
		console.log('Attempting sign in...');
		const token = await this.authService.signIn(req.user as User42);

		console.log(`Got token: ${token}`);
		const url = new URL(`${req.protocol}:${req.hostname}`);
		url.pathname = '';
		url.port = '3000';
		url.searchParams.set('code', token);
		res.status(302).redirect(url.href);
	}
}

// http%3A%2F%2Flocalhost%3A1919%2Fusers%2Fauth%2Fft%2Fcallback
// http%3A%2F%2Flocalhost%3A3000%2Fauth%2F42%2Fcallback