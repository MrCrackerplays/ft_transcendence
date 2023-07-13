import { PublicAchievements } from "./public-achievement";

// PublicUser is what the backend sends to the frontend. It's what's supposed to be public to the users
export interface PublicUser {
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
	let retValue : PublicUser = {
		id : "",
		userName : "N/A",
		gamesPlayed : 0,
		gamesWon : 0,
		score : 0,
		active : false,
		status : 'OFFLINE',
		imageURL : "N/A",
		achievements : [],
	}
	return (retValue);
}

export default DefaultProfile