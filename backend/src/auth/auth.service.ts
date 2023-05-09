import { Injectable, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/user.service";
import { User42 } from "./interfaces/user42.interface";
import { ConnectionService } from "./connection.service";
import { Connection } from "./connection.entity";
import { User } from "src/users/user.entity";
import { Request } from "express";
import { UserPayload } from "src/interfaces/authrequest.interface";


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

	signConnection(connection: Connection) : string {
		console.log(`Signing payload with sub: ${connection.id}`);
		return this.jwtService.sign({ sub: connection.id });
	}

	buildCookie(connection: Connection) : string {
		const token = this.signConnection(connection);
		console.log(`Building cookie with signed-token: ${token}`);
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=100000`;
	}

	async getCurrentUser(@Req() req: any): Promise<User> {
		const user42 : User42 = req.user as User42;

		if (!user42)
			return (null);
		return ((await this.connectionService.get({ id: user42.id })).user);
	}

}
