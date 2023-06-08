import React, { useEffect, useState } from 'react';
import MatchHistory from './flexbox/matchhistory/matchhistory';
import Userbar from './flexbox/userbar/userbar';
import FetchSelf from '../../hooks/fetch/FetchSelf';
import FetchUser from '../../hooks/fetch/FetchUser';
import { Constants } from "../../../../shared/constants";
import DefaultProfile, { PublicUser } from '../../../../shared/public-user';
import { useLocation, useParams } from 'react-router-dom';
import './profile.css'
import AddFriend from './addfriend';
import SearchBar from './search';
import Chat from '../../hooks/chat/chat';

function TestSidebar({name}) {
	return (
		<>
			<div style={{width:"250px",right:"0", top: "0", bottom: "0", position: "fixed", overflow: "auto", display: "flex", flexDirection: "column", color: "white"}}>
				<h1 style={{paddingBottom:"250px"}}>Test</h1>
				<hr style={{width: "90%"}}/>
				<h1>Test</h1>
				<hr style={{width: "90%"}}/>
				<Chat sender={name} />
			</div>
		</>
	)
}

// function ProfilePage()
// {
// 	const [loginChecked, setLoginChecked] = useState(false);
// 	const [jsonData, setJsonData] = useState([] as any);
// 	useEffect(() => {
// 		async function checkLogin() {
//     		const value = await FetchSelf();
//     		if (value)
// 				setJsonData(value);
//     	}
//     checkLogin();
// 	}, []);
  
// 	console.log(jsonData)
// 	return(
// 		<div>
// 			<MyNavBar name={jsonData.userName} imgsrc={jsonData.imageURL} />
// 			<TestSidebar name={jsonData.userName} />
// 			<Userbar name={jsonData.userName}/>
// 			<MatchHistory />
// 		</div> 				
function ProfilePage() {
	const [isLoading, setIsLoading] = useState(true);
	const [jsonData, setJsonData] = useState<PublicUser>(DefaultProfile());
	const profile = useLocation().pathname.replace("/profile", "")
	const fetchPFP = Constants.FETCH_USERS;
	const id = useParams();
	useEffect(() => {
		async function checkLogin() {
			console.log(id);
			if (profile.length == 0 || profile.length == 1)
				setJsonData(await FetchSelf())
			else
				setJsonData(await FetchUser(profile))
			setIsLoading(false);
		}
		setIsLoading(true);
		checkLogin();
	}, [id]);
	if (isLoading)
		return (<div />);
	if (!jsonData) {
		return (<div><h1>User Not Found</h1></div>);
	}
	return (
		<div className="container">
				<div className="SelectBar">SELECTBAR</div>
				<div className="Name"><Userbar name={jsonData.userName} /></div>
				<div><TestSidebar name={jsonData.userName}/></div>
				<div className="Profile">
					<img src={`${fetchPFP}/${jsonData.userName}/pfp`} className='PFP'/>
					<div className='PFP-Border'></div>
				</div>
				<div className="Add-Friend"><AddFriend UUID={jsonData.id}/></div>
				<div className="Stats">STATS GO HERE</div>
				<div className="FLEXBOX">FLEEEEEEEXBOX</div>
				<div className="Search"><SearchBar /></div>
				<div className="NA"></div>
		</div>
	)
}

export default ProfilePage;