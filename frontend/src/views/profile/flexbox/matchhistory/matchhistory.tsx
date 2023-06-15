import './matchhistory.css'
import React, {useEffect, useState} from "react"
import { PublicMatch } from "../../../../../../shared/public-match"
import { Constants } from '../../../../../../shared/constants';
import FetchUserMatchHistory from '../../../../hooks/fetch/FetchUserMatchHistory';
import { PublicUser } from '../../../../../../shared/public-user';


function MatchCard({ match, username } : {match:PublicMatch, username:string}) {
	const leftside: PublicUser = (match.winner.userName === username) ? match.winner : match.loser;
	// console.log(leftside, username);
	const leftsideScore: number = (match.winner.userName === username) ? match.winnerScore : match.loserScore; 
	const rightside: PublicUser = (match.winner.userName !== username) ? match.winner : match.loser;
	const rightsideScore: number = (match.winner.userName !== username) ? match.winnerScore : match.loserScore;
	
	// console.log(leftside)
	const textcolor = (match.winner.userName == username) ? "green" : "red";
	const display = (match.winner.userName == username) ? "Victory" : "Defeat";
	const fetchPFP = Constants.FETCH_USERS;

	return (
		<div className={`match-card ${textcolor}border monospace`}>
			<div className="left-player">
				<img src={`${fetchPFP}/${leftside.userName}/pfp`} alt="pfp not found"/>
				<p >{leftside.userName}</p>
			</div>
			<div className="center-score"> 
				<h1 className={`${textcolor}`}>{display}</h1>
				<div className="center-row">
					<p>{leftsideScore}</p>
					<p>-</p>
					<p>{rightsideScore}</p>
				</div>
				<p className={"gamemode"}>{match.gameMode}</p>
			</div>
			<div className="right-player">
				<img src={`${fetchPFP}/${rightside.userName}/pfp`} alt="pfp not found"/>
				<p >{rightside.userName}</p>
			</div>
		</div>
	)
}

function MatchHistory({username}: {username:string}) {

	const [jsonData, setJsonData] = useState<Array<PublicMatch>>([]);
	const [isLoading, setisLoading] = useState(false);
	useEffect(() => {
		async function checkJson() {
			const value = await FetchUserMatchHistory(username)
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
	// console.log(jsonData)
	return (
		<div className="all-matches">
			{ 
				jsonData.map((user, index) => (
					<MatchCard key={index} match={user} username={username}/> 
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