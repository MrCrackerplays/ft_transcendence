import { useEffect, useState } from "react";
import { PublicUser } from "../../../../../shared/public-user";
import './stats.css'

function MyStats({user} : {user:PublicUser})
{
	const [winpercent, setwinpercent] = useState<number>(0);
	const [lostpercent, setlostpercent] = useState<number>(0);
	useEffect(() => {
		function valuecheck(){
			if (user.gamesPlayed == 0)
			{
				setlostpercent(0);
				setwinpercent(100);
				return ;
			}
			setwinpercent(user.gamesWon / user.gamesPlayed);
			setlostpercent(100 - winpercent);
		}
		valuecheck()
	}, []);
	return (
		<div className="stats">
			<h1 className="title">Statistics</h1>	
			<div className="percentage">
				<p className="win">Win : {winpercent}%</p>
				<p className="loss">{lostpercent}% : Loss</p>
			</div>
			<p>Games Played: {user.gamesPlayed}</p>
			<p>Games Won: {user.gamesWon}</p>
			<p>Games Lost: {user.gamesPlayed - user.gamesWon}</p>
			{/* <p>User Score: {user.score}</p> */}
		</div>
	)
}

export default MyStats