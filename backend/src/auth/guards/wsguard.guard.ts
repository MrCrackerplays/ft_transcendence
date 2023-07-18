import { CanActivate, Injectable, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class WsGuard implements CanActivate {

	constructor(private jwtService: JwtService) {
	}

	canActivate(
		context: any,
	): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
		const auth_cookie = context.args[0].handshake.headers.cookie?.split(';')?.map(cookie => cookie.split('='))?.find(cookie => cookie[0].trim() === 'Authentication')?.[1].trim();
		try {
			const decoded = this.jwtService.verify(auth_cookie, { secret: process.env.JWT_SECRET });;
			if (decoded) {
				return true;
			}
			return false;
		} catch (ex) {
			return false;
		}
	}
}