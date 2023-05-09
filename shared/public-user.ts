// PublicUser is what the backend sends to the frontend. It's what's supposed to be public to the users
export class PublicUser {
	id: string;
	userName: string;
	score: number;
	gamesPlayed: number;
	gamesWon: number;
	active: boolean;
	imageURL: string;
}
