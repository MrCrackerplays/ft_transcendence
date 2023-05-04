import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/user.service";
import { User42 } from "./interfaces/user42.interface";
import { ConnectionService } from "./connecton.service";
import { Connection } from "./connection.entity";


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
		return this.jwtService.sign({ sub: connection.id });
	}

	buildCookie(connection: Connection) : string {
		const token = this.signConnection(connection);
		console.log(`Building cookie with signed-token: ${token}`);
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=100000`;
	}
}
