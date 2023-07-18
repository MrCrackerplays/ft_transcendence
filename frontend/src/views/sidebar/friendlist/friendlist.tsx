import './friendlist.css'
import FetchFriends from "../../../hooks/fetch/FetchFriends";
import { useState, useEffect } from "react";
import { PublicUser } from "../../../../../shared/public-user";
import { Constants } from "../../../../../shared/constants";
import { useNavigate } from 'react-router-dom';
import { Popover } from '@headlessui/react';

function ProfileLink({label, link}: {label:string, link: string})
{
	const navigate = useNavigate();
	async function handleClick()
	{
		navigate(`${link}`)
	}
	return (
		<div className="fmylink" onClick={handleClick}>
			{label}
		</div>
	)
}

function MyLinks({ username, userID, startDM } : { username: string, userID: string, startDM: (id: string) => void })
{
	return (
		<div className='fpfp-popover-content a'>
			<ProfileLink label="Profile" link={`/profile/${username}`} />
			<div className="fmylink" onClick={()=>{
				// alert("temporarily disabled while query is wrong")
				startDM(userID);
			}}>Send Message</div>
		</div>
	);
}

function FriendCard({ friend, startDM }: { friend: PublicUser, startDM: (id: string) => void })
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
				<MyLinks username={friend.userName} userID={friend.id} startDM={startDM} />
			</Popover.Panel>
		</Popover>
	  )
}

function MyFriendsList({ startDM }: { startDM: (id: string) => void }) {
	const [friendArray, setFriendArray] = useState<PublicUser[]>([]);
	const [isLoading, setisLoading] = useState(true);
	
	async function getFriends() {
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
					<FriendCard key={friend.id} friend={friend} startDM={startDM} />
				))
			}
		</div>
	)
}

export default MyFriendsList