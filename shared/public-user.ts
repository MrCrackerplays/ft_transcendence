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

function DefaultProfile()
{
	let retValue : PublicUser = new PublicUser;
	retValue.id = "";
	retValue.userName = "N/A";
	retValue.gamesPlayed = 0;
	retValue.gamesWon = 0;
	retValue.active = false;
	retValue.imageURL = "N/A"
	return (retValue);
}

export default DefaultProfile