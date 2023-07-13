import { PublicUser } from "./public-user";

export interface PublicMatch {
	date: string;
	gameMode: string;
	id: string;
	loser: PublicUser;
	loserScore: number;
	winner: PublicUser;
	winnerScore: number;
}
