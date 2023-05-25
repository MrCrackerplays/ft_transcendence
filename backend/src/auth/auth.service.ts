import { HttpException, HttpStatus, Injectable, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/user.service";
import { Payload } from "./interfaces/payload.interface";
import { ConnectionService } from "./connection.service";
import { Connection } from "./connection.entity";
import { User } from "src/users/user.entity";
import { AuthRequest } from "src/interfaces/authrequest.interface";
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";

@Injectable()
export class AuthService {
	constructor(
		private userService : UserService,
		private connectionService : ConnectionService,
		private jwtService: JwtService
		) {}

	async signIn(payload: any): Promise<Connection> {
		console.log(`attempting signin for 42-user: ${payload.id}`);

		// Get existing connection from the provided user42
		let con = await this.connectionService.get({ user42ID: payload.id });

		// Create new one if not existant
		if (!con) {
			const user = await this.userService.create();					// New user
			con = await this.connectionService.create(user, payload.id);	// Make a new connection for this user
		}
		else
		{
			console.log(`Connection exists for 42: ${payload.id}`);
		}

		// Return Connection
		return con;
	}

	async signInOTP(req: AuthRequest, code: string): Promise<Connection> {
		// verify the JWT token
		let jwt = null;
		try {jwt = this.jwtService.verify(req?.cookies?.Authentication);}
		catch (err) {
			console.log(err);
			return null;
		}
		if (!jwt)
			throw new HttpException('Invalid JWT', HttpStatus.FORBIDDEN);
		if (jwt.otp)
			throw new HttpException('Already signed in', HttpStatus.CONFLICT);
		return this.validateTwoFactor(jwt.id, code);
	}

	async getTwoFactorEnabled(req: AuthRequest): Promise<boolean> {
		const connection = await this.getCurrentConnection(req);
		if (!connection)
			throw new HttpException('No connection', HttpStatus.FORBIDDEN);

		let has2FA = false;
		if (connection.otpSecret)
			has2FA = true;
		return (has2FA);
	}

	// Enable 2FA and return QRCODE
	async enableTwoFactor(req: AuthRequest): Promise<string> {
		const connection = await this.getCurrentConnection(req);
		const data = await this.generateTwoFactorSecret(connection);

		// store secret
		// !: 2FA IS NOW ENABLED!
		connection.otpSecret = data.secret;
		await connection.save();

		return toDataURL(data.otpURL);
	}

	async validateTwoFactor(_id: number, code: string): Promise<Connection> {
		const connection = await this.connectionService.get({id: _id});

		const secret = connection.otpSecret;
		const validated : boolean = this.validateOTP(secret, code);
		if (!validated)
			return null;
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

	signPayload(conn: Connection, _otp: boolean) : string {
		console.log(`Signing payload with id: ${conn.id}`);
		return this.jwtService.sign({ id: conn.id, otp: _otp });
	}

	signAndGetCookie(conn: Connection, otp : boolean) : string {
		const token = this.signPayload(conn, otp);
		console.log(`Building cookie with signed-token: ${token}, and otp: ${otp}`);
		return (`Authentication=${token}; HttpOnly; Path=/; Max-Age=100000`);
	}

	async getCurrentConnection(req: AuthRequest): Promise<Connection> {
		let conn : Connection = null;

		if (!req.user)
			throw new HttpException('No request user data', HttpStatus.BAD_REQUEST);

		try { conn = await this.connectionService.get({ id: req.user.id }); }
		catch (err) {
			throw new HttpException('Connection not found', HttpStatus.NOT_FOUND);
		}
		return conn;
	}
	
	async getCurrentUser(@Req() req: any): Promise<User> {
		const payload = req.user as Payload;

		if (!payload || !payload.id)
			return (null);
		return ((await this.connectionService.get({ id: payload.id })).user);
	}

}
