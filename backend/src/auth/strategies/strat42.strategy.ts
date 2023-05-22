import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-42';

import { AuthService } from "../auth.service";

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({clientID: process.env.ID42, clientSecret: process.env.SECRET42, callbackURL: process.env.CALLBACK42});
	}

	validate(accessToken: string, refrToken: string, user42: any): any {
		return user42;
	}
}
