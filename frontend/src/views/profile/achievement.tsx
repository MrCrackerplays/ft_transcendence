import { Card, Container } from "@mui/material"
import './achivement.css'
import pfp from './Tateru.png'
import pfp2 from './Tortenite.png'

function AchievementCard({ user }: { user:UserStats}) {
	const textcolor = user.win ? "green" : "red";
	const display = user.win ? "Victory" : "Defeat";

	return (
		<div className={`achievement-card${textcolor} monospace`}>
			<div className="left-player">
				<img src={user.userPFP} alt="pfp not found"/>
				<p>{user.userName}</p>
			</div>
			<div className="center-score">
				<h1 className={`victory-loss${textcolor}`}>{display}</h1>
				<div className="center-row">
					<p>{user.userScore}</p>
					<p>-</p>
					<p>{user.opponentScore}</p>
				</div>
				<p className={"gamemode"}>{user.gameMode}</p>
			</div>
			<div className="right-player">
				<img src={user.opponentPFP} alt="pfp not found"/>
				<p>{user.opponentName}</p>
			</div>
		</div>
	)
}

class UserStats
{
	userName: string;
	userPFP: string;
	userScore: string;
	gameMode: string;
	win: boolean;
	opponentName: string;
	opponentPFP: string;
	opponentScore: string;

	constructor() {
		this.userName = "Tateru";
		this.userPFP = pfp;
		this.userScore = "10";
		this.gameMode = "Normal"
		this.win = true;
		this.opponentName = "Tortenite"
		this.opponentPFP = pfp2;
		this.opponentScore = "03";
	}
}

function MyAchievement() {
	var user = new UserStats();
	var user2 = new UserStats();
	user2.win = false;
	user2.userScore = "00";
	user2.opponentScore = "10";
	return (
		<div className="all-achievements">
			<AchievementCard user={user} />
			<AchievementCard user={user2} />
			<AchievementCard user={user} />
			<AchievementCard user={user2} />
			<AchievementCard user={user2} />
		</div>
	)
}

export default MyAchievement