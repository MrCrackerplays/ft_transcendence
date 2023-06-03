import { Card, Container } from "@mui/material"
import './friendlist.css'
import FetchFriends from "../../../../hooks/fetch/FetchFriends";
import { useState, useEffect } from "react";
import DefaultProfile, { PublicUser } from "../../../../../../shared/public-user";
import { Constants } from "../../../../../../shared/constants";

function FriendCard({ friend }: {friend: PublicUser}){
	const textcolor = "white";
	const fetchPFP = Constants.FETCH_USERS;

	return (
		<div className="friend-card">
			<img src={`${fetchPFP}/${friend.userName}/pfp`} alt="pfp not found" />
			<p className={'ONLINE'}>{friend.userName}</p>
		</div>
	)
}

// class FriendStatus
// {
// 	name: string;
// 	pfp: string;
// 	status: string;
// 	constructor() {
// 		this.name = "Friend1"
// 		this.pfp = pfp;
// 		this.status = "ONLINE";
// 	}
// }

function MyFriendsList() {
	const [friendArray, setFriendArray] = useState<Array<PublicUser>>([]);
	const [isLoading, setisLoading] = useState(true);
	useEffect(() => {
		async function getFriends() {
			setFriendArray(await FetchFriends());
			setisLoading(false);
		}
		getFriends();
	}, [])
	if (isLoading)
		return (<div></div>)
	return (
		<div className="all-friends">
			{
				friendArray.map((friend) => (
					<FriendCard key={friend.id} friend={friend} />
				))
			}
		</div>
	)
}

export default MyFriendsList