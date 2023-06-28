import { PublicAchievements } from "./public-achievement";

// PublicUser is what the backend sends to the frontend. It's what's supposed to be public to the users
export class PublicUser {
	id: string;
	userName: string;
	score: number;
	gamesPlayed: number;
	gamesWon: number;
	active: boolean;
	status:	string;
	imageURL: string;
	achievements: PublicAchievements[];
}

function DefaultProfile()
{
	let retValue : PublicUser = new PublicUser;
	retValue.id = "";
	retValue.userName = "N/A";
	retValue.gamesPlayed = 0;
	retValue.gamesWon = 0;
	retValue.active = false;
	retValue.status = 'OFFLINE';
	retValue.imageURL = "N/A";
	retValue.achievements = [];
	return (retValue);
}

export default DefaultProfile