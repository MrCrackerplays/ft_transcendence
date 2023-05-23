import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"

import { AuthRequest } from "src/interfaces/authrequest.interface";
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
		if (!payload)
			throw new HttpException('No Payload Provided', HttpStatus.BAD_REQUEST);
		// !: BEING IGNORED FOR NOW
		if (!payload.finished)
			throw new HttpException('Profile not yet finished', HttpStatus.FORBIDDEN);
		if (!payload.otp)
			throw new HttpException('OTP Token Required', HttpStatus.FORBIDDEN);
		return payload;
	}
}