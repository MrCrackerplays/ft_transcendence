import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"

import { AuthRequest } from "src/auth/interfaces/authrequest.interface";
import { Payload } from "../interfaces/payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: AuthRequest) => {
				return request?.cookies?.Authentication;
			}]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET
		});
	}

	validate(payload: Payload): any {
		if (!payload || !payload.otp)
			throw new HttpException('OTP Token Required', HttpStatus.FORBIDDEN);
		return payload;
	}
}