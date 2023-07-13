import { useEffect, useState } from "react";
import FetchUserAcheivements from "../../../../hooks/fetch/FetchUserAchievements";
import { PublicAchievements } from "../../../../../../shared/public-achievement";
import './achievements.css'

function AchievementCard({achieve} : {achieve : PublicAchievements}) {
	return (
		<div className="achievement-container">
			<div className="ACHIEVE-IMAGE">
				<img src={achieve.imageURL} alt="Uhhhhh, yea, its missing." />
			</div>
			<div className="ACHIEVE-TITLE">
				<p>{achieve.name}</p>
			</div>
			<div className="ACHIEVE-DESCRIPTION">
				<p>{achieve.description}</p>
			</div>
		</div>
	)
}

function Achievements({achievements}: {achievements:PublicAchievements[]}) {
	if (achievements.length == 0)
		return (<div><p className="achievementsCenter">No Achievements Recorded</p></div>)
	return (
		<div className="all-achievements">
			{ 
				achievements.map((achieve, index) => (
					<AchievementCard key={index} achieve={achieve}/> 
				))
			}
		</div>
	)
}

export default Achievements