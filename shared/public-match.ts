import { User } from "src/users/user.entity";

export class PublicMatch {
	id: string;

	p1: User;
	p2: User;

	p1Score: number;
	p2Score: number;

	winner: number;
}