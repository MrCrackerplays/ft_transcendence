import { Card, Container } from "@mui/material"
import './friendlist.css'
import FetchFriends from "../../../../hooks/fetch/FetchFriends";
import { useState, useEffect } from "react";
import DefaultProfile, { PublicUser } from "../../../../../../shared/public-user";
import { Constants } from "../../../../../../shared/constants";

import UserStatus from "../../../../hooks/userStatus/userStatus";

function FriendCard({ friend, setcurrentFriend, ownID, currentFriend }: {friend: PublicUser, setcurrentFriend:(something: {userid: string, value: boolean}) => void , ownID: string, currentFriend: {userid:string, value:boolean}})
{
	const textcolor = "white";
	const fetchPFP = Constants.FETCH_USERS;
	const [active, setactive] = useState(false);
	function handleMouseDown()
	{
		if (ownID == currentFriend.userid)
			setcurrentFriend({...currentFriend, value: !currentFriend.value});
		else
			setcurrentFriend({userid: ownID, value: true});
	}
	const test = () => {
		console.log("clickity");
		if (ownID == currentFriend.userid)
		{
			if (currentFriend.value == true)
				return ("greenfriend");
			// return (currentFriend.value)
		}
		return ("redfriend")
	}
	const action = test();
	return (
		<div className={`friend-card ${action}`} onMouseDown={handleMouseDown}>
			<img src={`${fetchPFP}/${friend.userName}/pfp`} alt="pfp not found" />
			<p className={friend.status}>{friend.userName}</p>
		</div>
	)
}

function MyFriendsList() {
	const [friendArray, setFriendArray] = useState<PublicUser[]>([]);
	const [currentFriend, setcurrentFriend] = useState({userid: "", value: false})
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
				friendArray.map((friend) => (
					<FriendCard key={friend.id} friend={friend} setcurrentFriend={setcurrentFriend} ownID={friend.id} currentFriend={currentFriend}/>
				))
			}
		</div>
	)
}

export default MyFriendsList