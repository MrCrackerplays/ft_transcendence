import { User } from "src/users/user.entity";
import { PublicUser } from "./public-user";

export class PublicMatch {
	date: string;
	gameMode: string;
	id: string;
	loser: PublicUser;
	loserScore: number;
	winner: PublicUser;
	winnerScore: number;
}
