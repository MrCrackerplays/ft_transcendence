import { Card, Container } from "@mui/material"
import './matchhistory.css'
import pfp from './Tateru.png'
import pfp2 from './Tortenite.png'
import React, {useEffect, useState} from "react"

class Match {
	id!: string
	date!: Date
	winner: any;
	loser: any;
	winnerScore!: number
	loserScore!: number
	gameMode!: string
}

function MatchCard({ user }) {
	const textcolor = user.winner ? "red" : "green";
	const display = user.winner ? "Defeat" : "Victory";

	// console.log(user)
	return (
		<div className={`match-card ${textcolor}border monospace`}>
			<div className="left-player">
				<img src={user} alt="pfp not found"/>
				<p>{user.players[0].userName}</p>
			</div>
			<div className="center-score">
				<h1 className={`${textcolor}`}>{display}</h1>
				<div className="center-row">
					<p>{user.p1Score}</p>
					<p>-</p>
					<p>{user.p2Score}</p>
				</div>
				<p className={"gamemode"}>{user.gameMode}</p>
			</div>
			<div className="right-player">
				<img src={user.p2} alt="pfp not found"/>
				<p>{user.players[1].userName}</p>
			</div>
		</div>
	)
}

async function getMatchHistory() {

	const res = await fetch('http://localhost:3000/self/matches', {
		credentials: 'include'
	});
	if (!res.ok)
		console.log("something wrong");
	const jsonData = await res.json();
	return jsonData;
}

function MatchHistory() {

	const [jsonData, setJsonData] = useState([] as any);

	useEffect(() => {
		async function checkJson() {
			const value = await getMatchHistory()
			// console.log(value)
			if (value)
				setJsonData(value);	
		}
		checkJson();
	}, []);
	return (
		<div className="all-matchs">
			{ 
				jsonData.map((user, index) => (
					<MatchCard key={index} user={user} /> 
				))
			}
		</div>
	)
}

export default MatchHistory