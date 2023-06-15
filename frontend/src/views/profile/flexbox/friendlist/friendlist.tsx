import { Card, Container } from "@mui/material"
import './friendlist.css'
import FetchFriends from "../../../../hooks/fetch/FetchFriends";
import { useState, useEffect } from "react";
import DefaultProfile, { PublicUser } from "../../../../../../shared/public-user";
import { Constants } from "../../../../../../shared/constants";

import UserStatus from "../../../../hooks/userStatus/userStatus";

function FriendCard({ friend }: {friend: PublicUser}){
	const textcolor = "white";
	const fetchPFP = Constants.FETCH_USERS;

	return (
		<div className="friend-card">
			<img src={`${fetchPFP}/${friend.userName}/pfp`} alt="pfp not found" />
			<p className={friend.status}>{friend.userName}</p>
		</div>
	)
}

function MyFriendsList() {
	const [friendArray, setFriendArray] = useState<PublicUser[]>([]);
	const [useStateArray, setStateArray] = useState<boolean[]>([]);
	const [isLoading, setisLoading] = useState(true);
	
	async function getFriends() {
		console.log("fetched some friends");
		setFriendArray(await FetchFriends());
		setisLoading(false);
	}

	useEffect(() => {
		getFriends();
		const interval = setInterval(() => {
				getFriends(); 
			}, 1000);
			return () => clearInterval(interval);
	}, [])

	if (isLoading)
		return (<div></div>)
	return (
		<div className="all-friends">
			{
				friendArray.map((friend, id) => (
					<FriendCard key={friend.id} friend={friend} setStateArray={setStateArray} ownNumber={id} useStateArray={useStateArray}/>
				))
			}
		</div>
	)
}

export default MyFriendsList