import React, { useEffect, useState } from 'react';
import MatchHistory from './flexbox/matchhistory/matchhistory';
import Userbar from './flexbox/userbar/userbar';
import FetchSelf from '../../hooks/fetch/FetchSelf';
import FetchUser from '../../hooks/fetch/FetchUser';
import { Constants } from "../../../../shared/constants";
import DefaultProfile, { PublicUser } from '../../../../shared/public-user';
import { useLocation, useParams } from 'react-router-dom';
import './profile.css'
import Chat from '../../hooks/chat/chat';
import AddFriend from './misc/addfriend';
import SearchBar from './misc/search';
import MyStats from './misc/stats';
import SelectBar from './selectbar/selectbar';
import { match } from 'assert';

function TestSidebar({name, id}) {
	return (
		<>
			<div style={{width:"250px",right:"0", top: "0", bottom: "0", position: "fixed", overflow: "auto", display: "flex", flexDirection: "column", color: "white"}}>
				<h1 style={{paddingBottom:"250px"}}>Test</h1>
				<hr style={{width: "90%"}}/>
				<h1>Test</h1>
				<hr style={{width: "90%"}}/>
				<Chat sender={name} sender_id={id} />
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
	const url = useLocation().pathname.replace("/profile", "")
	const fetchPFP = Constants.FETCH_USERS;
	const [matchhistory, setmatchhistory] = useState(true); // THIS IS SET TRUE OR FALSE IN SELECTBAR
	const id = useParams();

	useEffect(() => {
		async function checkLogin() {
			if (url.length == 0 || url.length == 1)
				setJsonData(await FetchSelf())
			else
				setJsonData(await FetchUser(url))
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
				<div className="SelectBar"><SelectBar matchhistory={matchhistory} setmatchhistory={setmatchhistory}/></div>
				<div className="Name"><Userbar name={jsonData.userName} /></div>
				<div className="testsidebar"><TestSidebar name={jsonData.userName} id={jsonData.id}/></div>
				<div className="Profile">
					<img src={`${fetchPFP}/${jsonData.userName}/pfp`} className='PFP'/>
					<div className='PFP-Border'></div>
				</div>
				<div className="Add-Friend"><AddFriend UUID={jsonData.id}/></div>
				<div className="Stats"><MyStats user={jsonData}/></div>
				<div className="FLEXBOX">{matchhistory ? <MatchHistory username={jsonData.userName}/> : "Achievements go here"}</div>
				<div className="Search"><SearchBar /></div>
				<div className="NA"></div>
		</div>
	)
}

export default ProfilePage;