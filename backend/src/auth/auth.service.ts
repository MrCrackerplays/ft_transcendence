import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/user.service";
import { User42 } from "./interfaces/user42.interface";
import { ConnectionService } from "./connecton.service";


@Injectable()
export class AuthService {
	constructor(
		private userService : UserService,
		private connectionService : ConnectionService,
		private jwtService: JwtService
		) {}

	async signIn(user42: User42): Promise<any> {
		// Get existing connection from the provided user42
		let con = await this.connectionService.get({ user42ID: user42.id });

		// Create new one if not existant
		if (!con) {
			const user = await this.userService.create();					// New user
			con = await this.connectionService.create(user.id, user42.id);	// Make a new connection for this user
		}

		// Return JWT token
		return {
			access_token: await this.jwtService.signAsync({ sub: con.id })
		};
	}
}
