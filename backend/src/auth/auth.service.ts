import { HttpException, HttpStatus, Injectable, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/user.service";
import { User42 } from "./interfaces/user42.interface";
import { ConnectionService } from "./connection.service";
import { Connection } from "./connection.entity";
import { User } from "src/users/user.entity";
import { Request } from "express";
import { AuthRequest, UserPayload } from "src/interfaces/authrequest.interface";
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { sign } from "crypto";


@Injectable()
export class AuthService {
	constructor(
		private userService : UserService,
		private connectionService : ConnectionService,
		private jwtService: JwtService
		) {}

	async signIn(user42: User42): Promise<Connection> {
		console.log(`attempting signin for 42-user: ${user42.id}`);

		// Get existing connection from the provided user42
		let con = await this.connectionService.get({ user42ID: user42.id });

		// Create new one if not existant
		if (!con) {
			const user = await this.userService.create();					// New user
			con = await this.connectionService.create(user, user42.id);		// Make a new connection for this user
		}
		else
		{
			console.log(`Connection exists for 42: ${user42.id}, attempting to sign token`);
		}

		// Return Connection
		return con;
	}

	async signInOTP(req: AuthRequest, code: string): Promise<string> {
		// verify the JWT token
		const jwt = this.jwtService.verify(req?.cookies?.Authentication);
		if (!jwt)
			throw new HttpException('Invalid JWT', HttpStatus.FORBIDDEN);
		if (jwt.otp)
			throw new HttpException('Already signed in', HttpStatus.CONFLICT);
		const connection = await this.validateTwoFactor(req, code);
		return this.signConnection(connection, true);
	}

	async getTwoFactorEnabled(req: AuthRequest): Promise<boolean> {
		const connection = await this.connectionService.get({ id: req.user.id })
		if (!connection)
			throw new HttpException('No connection', HttpStatus.FORBIDDEN);

		let has2FA = false;
		if (connection.otpSecret)
			has2FA = true;
		return (has2FA);
	}

	// Enable 2FA and return QRCODE
	async enableTwoFactor(req: AuthRequest): Promise<string> {
		if (!req.user || !req.user.id)
			throw new HttpException('Bad Data', HttpStatus.FORBIDDEN);
		
		const connection = await this.connectionService.get({ id: req.user.id });
		const data = await this.generateTwoFactorSecret(connection);

		return toDataURL(data.otpURL);
	}

	async validateTwoFactor(req: AuthRequest, code: string): Promise<Connection> {
		if (!req.user || !req.user.id || !code)
			throw new HttpException('Bad Data', HttpStatus.FORBIDDEN);

		const connection = await this.connectionService.get({ id: req.user.id });

		const secret = connection.otpSecret;
		const validated : boolean = this.validateOTP(secret, code);
		if (!validated)
			throw new HttpException('Invalid Token', HttpStatus.FORBIDDEN);
		// ?
		return connection;
	}

	async generateTwoFactorSecret(connection: Connection): Promise<any> {
		const secret  = authenticator.generateSecret();

		// TODO: change accountName
		const otpURL = authenticator.keyuri(`${connection.id}`, 'Ball Busters', secret);

		this.connectionService.setTwoFactorSecret(connection, secret);

		return { secret, otpURL };
	}

	async disableTwoFactor(connection: Connection) {
		connection.otpSecret = null;
		connection.save();
	}

	// async generateQR(connection: Connection): Promise<string> {
	// 	const secret = await this.generateTwoFactorSecret(connection);
	// 	return toDataURL(secret.otpURL);
	// }

	validateOTP(_secret: string, code: string): boolean {
		if (!_secret)
			throw new HttpException('No Secret', HttpStatus.FORBIDDEN);
		return authenticator.verify({ token: code, secret: _secret });
	}

	signConnection(connection: Connection, otp: boolean) : string {
		console.log(`Signing payload with sub: ${connection.id}`);
		return this.jwtService.sign({ sub: connection.id, otp });
	}

	buildCookie(connection: Connection) : string {
		const token = this.signConnection(connection, !connection.otpSecret);
		console.log(`Building cookie with signed-token: ${token}`);
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=100000`;
	}

	async getCurrentConnection(req: AuthRequest): Promise<Connection> {
		return this.connectionService.get({ id: req.user.id });
	}
	
	async getCurrentUser(@Req() req: any): Promise<User> {
		const user42 : User42 = req.user as User42;

		if (!user42)
			return (null);
		return ((await this.connectionService.get({ id: user42.id })).user);
	}

}
