import './matchhistory2.css'
import React, {useEffect, useState} from "react"
import FetchMatchHistory from "../../../../hooks/fetch/FetchSelfMatchHistory"
import { PublicMatch } from "../../../../../../shared/public-match"
import { Constants } from '../../../../../../shared/constants';

function MatchCard({ match } : {match:PublicMatch}) {
	const textcolor = match.winner ? "red" : "green";
	const display = match.winner ? "Defeat" : "Victory";
	const fetchPFP = Constants.FETCH_USERS;
	return (
		<div className={`match-card ${textcolor}border monospace`}>
			<div className="left-player">
				<img className="img" src={`${fetchPFP}/${match.winner.userName}/pfp`} alt="pfp not found"/>
				<p className="names">{match.winner.userName}</p>
			</div>
			<div className="center-score"> 
				<h1 className={`${textcolor}`}>{display}</h1>
				<div className="center-row">
					<p>{match.winnerScore}</p>
					<p>-</p>
					<p>{match.loserScore}</p>
				</div>
				<p className={"gamemode"}>{match.gameMode}</p>
			</div>
			<div className="right-player">
				<img className="img" src={`${fetchPFP}/${match.loser.userName}/pfp`} alt="pfp not found"/>
				<p className="names">{match.loser.userName}</p>
			</div>
		</div>
	)
}

function MatchHistory({username}: {username:string}) {

	const [jsonData, setJsonData] = useState<Array<PublicMatch>>([]);
	const [isLoading, setisLoading] = useState(false);
	useEffect(() => {
		async function checkJson() {
			const value = await FetchMatchHistory()
			// console.log(value)
			if (value)
				setJsonData(value);
			setisLoading(false);
		}
		checkJson();
	}, []);
	if (isLoading)
		return (<div style={{color:"white"}}>Matches are loading...</div>)
	if (jsonData.length == 0)
		return (<div style={{color:"white"}}>no matches played</div>)
	console.log(jsonData)
	return (
		<div className="all-matchs">
			{ 
				jsonData.map((user, index) => (
					<MatchCard key={index} match={user} /> 
				))
			}
		</div>
	)
}

export default MatchHistory

// import { useEffect, useState } from "react";
// import { PublicMatch } from "../../../../../../shared/public-match";
// import FetchMatchHistory from "../../../../hooks/fetch/FetchMatchHistory";

// function MatchHistory()
// {
// 	const [matcharray, setmatcharray] = useState<Array<PublicMatch>>([]);
// 	const [isLoading, setisLoading] = useState(false);
// 	useEffect(() => {
// 		async function fetchdata()
// 		{
// 			setmatcharray(await FetchMatchHistory());
// 			setisLoading(false);
// 		}
// 		fetchdata();
// 	}, []);

// 	if (isLoading)
// 		return (<div style={{color:"white"}}>Matches are loading...</div>)
// 	console.log(matcharray);
// 	return (
// 		<div>

// 		</div>
// 	)
// }

// export default MatchHistory