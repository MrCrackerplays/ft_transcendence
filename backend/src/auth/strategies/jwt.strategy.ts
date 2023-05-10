import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"
import { AuthRequest, UserPayload } from "src/interfaces/authrequest.interface";

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

	validate(payload: any): any {
		// if (!payload.otp)
		// 	throw new HttpException('OTP Token Required', HttpStatus.FORBIDDEN);
		return { id: payload.sub };
	}
}