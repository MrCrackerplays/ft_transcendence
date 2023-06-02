import React, { useEffect, useState } from 'react';
import MatchHistory from './flexbox/matchhistory/matchhistory';
import Userbar from './flexbox/userbar/userbar';
import FetchSelf from '../../hooks/fetch/FetchSelf';
import FetchUser from '../../hooks/fetch/FetchUser';
import { Constants } from "../../../../shared/constants";
import DefaultProfile, { PublicUser } from '../../../../shared/public-user';
import { useLocation } from 'react-router-dom';
import './profile.css'
import AddFriend from './addfriend';
function ProfilePage() {
	const [loginChecked, setLoginChecked] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [jsonData, setJsonData] = useState<PublicUser>(DefaultProfile());
	const profile = useLocation().pathname.replace("/profile", "")
	const fetchPFP = Constants.FETCH_USERS;

	useEffect(() => {
		async function checkLogin() {
			if (profile.length == 0 || profile.length == 1)
				setJsonData(await FetchSelf())
			else
				setJsonData(await FetchUser(profile))
			setIsLoading(false);
		}
		checkLogin();
	}, []);

	if (isLoading)
		return (<div />);
	if (!jsonData) {
		console.log("return no user");
		return (<div />)
	}
	return (
		<div className="container">
			<div className="SelectBar">SELECT BAR</div>
			<div className="Name"><Userbar name={jsonData.userName} /></div>
			<div className="Profile"><img src={`${fetchPFP}/${jsonData.userName}/pfp`} className='PFP'/> <div className='PFP-Border'></div></div>
			<div className="Add-Friend"><AddFriend UUID={jsonData.id}/></div>
			<div className="Stats">STATS GO HERE</div>
			<div className="FLEXBOX">FLEEEEEEEXBOX</div>
			<div className="Search">FRIENDSEARCH</div>
			<div className="NA"></div>
		</div>
	)
}

export default ProfilePage;