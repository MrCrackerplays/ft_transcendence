import { Card, Container } from "@mui/material"
import './friendlist.css'
import FetchFriends from "../../../../hooks/fetch/FetchFriends";
import { useState, useEffect } from "react";
import DefaultProfile, { PublicUser } from "../../../../../../shared/public-user";
import { Constants } from "../../../../../../shared/constants";

function FriendCard({ friend, setStateArray, ownNumber, useStateArray }: {friend: PublicUser, setStateArray: (a: boolean[]) => void, ownNumber:number, useStateArray:boolean[]}){
	const textcolor = "white";
	const fetchPFP = Constants.FETCH_USERS;
	const [clicked, setClicked] = useState(false);

	const handleMouseDown = () => {
		const list : boolean[] = [...useStateArray]
		for (let item = 0; item < list.length; item++)
			if (item != ownNumber)
				list[item] = false;
		if (list[ownNumber] == false)
			list[ownNumber] = true;
		else
			list[ownNumber] = false;
		setStateArray(list);
	}
	const classname = useStateArray[ownNumber] ? "greenfriend" : "redfriend";
	// console.log('hello')
	return (
		<div className={`friend-card ${classname}`} onMouseDownCapture={handleMouseDown}>
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
	const [friendArray, setFriendArray] = useState<PublicUser[]>([]);
	const [useStateArray, setStateArray] = useState<boolean[]>([]);
	const [isLoading, setisLoading] = useState(true);

	useEffect(() => {
		async function getFriends() {
			setFriendArray(await FetchFriends());
			setisLoading(false);
		}
		getFriends();
	}, [])
	useEffect(() => {
		let list : Array<boolean> = [];	
		for (let i = 0; i < friendArray.length; i++)	
			list.push(false);
		setStateArray(list);
	},[friendArray])

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