import './friendlist.css'
import FetchFriends from "../../../hooks/fetch/FetchFriends";
import { useState, useEffect } from "react";
import { PublicUser } from "../../../../../shared/public-user";
import { Constants } from "../../../../../shared/constants";
import { Link, useNavigate } from 'react-router-dom';
import { Popover } from '@headlessui/react';

function ProfileLink({label, link}: {label:string, link: string})
{
	return (
		<Link to={link}>{label}</Link>
	)
}
  
function MyLinks({username} : {username: string})
{
	return (
	  <div className='fpfp-popover-content a'>
		<ProfileLink label="View Profile" link={`/profile/${username}`} />
	  </div>
	);
}

function FriendCard({ friend}: {friend: PublicUser})
{
	const fetchPFP = Constants.FETCH_USERS;	
	return (
		<Popover id={friend.id} className="fpfp-popover">
			<div className={`friend-card ${friend.status}`}>
				<Popover.Button className="fpfp-button">
					<img src={`${fetchPFP}/${friend.userName}/pfp`} alt="Missing" className="fpfp-circle-image"/>
				</Popover.Button>
				<p>{friend.userName}</p>
			</div>
			<Popover.Panel className="fpfp-popover-content">
				<MyLinks username={friend.userName}/>
			</Popover.Panel>
		</Popover>
	  )
}

function MyFriendsList() {
	const [friendArray, setFriendArray] = useState<PublicUser[]>([]);
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
		<div className="all-friends scrollable">
			{
				friendArray.map((friend) => (
					<FriendCard key={friend.id} friend={friend}/>
				))
			}
		</div>
	)
}

export default MyFriendsList