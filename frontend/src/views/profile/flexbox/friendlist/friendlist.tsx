import { Card, Container } from "@mui/material"
import './friendlist.css'
import pfp from './Tateru.png'

function FriendCard({ friend }: {friend:FriendStatus}){
	const textcolor = "white";
	
	console.log(`${textcolor}`)
	return (
		<div className="friend-card">
			<img src={friend.pfp} alt="pfp not found" />
			<p className={friend.status}>{friend.name}</p>
		</div>
	)
}

class FriendStatus
{
	name: string;
	pfp: string;
	status: string;

	constructor() {
		this.name = "Friend1"
		this.pfp = pfp;
		this.status = "ONLINE";
	}
}

function MyFriendsList() {
	var friend1 = new FriendStatus();
	var friend2 = new FriendStatus();
	var friend3 = new FriendStatus();

	friend2.name = 'friend2';
	friend2.status = "OFFLINE";
	friend3.name = 'friend3';
	friend3.status = "BUSY";
	return (
		<div className="all-friends">
			<FriendCard friend={friend1}/>
			<FriendCard friend={friend2}/>
			<FriendCard friend={friend3}/>
		</div>
	)
}

export default MyFriendsList