import { PublicUser } from "./public-user"

export class PublicMatch {
	id: string;

	p1: PublicUser;
	p2: PublicUser;

	p1Score: number;
	p2Score: number;

	winner: number;
}