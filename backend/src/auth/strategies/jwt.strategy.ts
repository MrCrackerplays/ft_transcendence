import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
				return request?.cookies?.Authentication;
			}]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET
		});
	}

	validate(payload: any): any {
		// Check payload OTP??
		return { userID: payload.sub };
	}
}