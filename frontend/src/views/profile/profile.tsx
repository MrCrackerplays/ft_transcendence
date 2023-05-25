import React, {useEffect, useState} from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import QueryTest from "./mainstats";
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import isLoggedIn from '../../hooks/isLoggedIn/isLoggedIn';
import MatchHistory from './components/matchhistory/matchhistory';
import Userbar from './components/userbar/userbar';
import FetchSelf from '../../hooks/fetch/FetchSelf';
import Chat from '../../hooks/chat/chat';
const queryClient = new QueryClient();

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

function ProfilePage()
{
	const [loginChecked, setLoginChecked] = useState(false);
	const [jsonData, setJsonData] = useState([] as any);
	useEffect(() => {
		async function checkLogin() {
    		const value = await FetchSelf();
    		if (value)
				setJsonData(value);
    	}
    checkLogin();
	}, []);
  
	console.log(jsonData)
	return(
		<div>
			<MyNavBar name={jsonData.userName} imgsrc={jsonData.imageURL} />
			<TestSidebar name={jsonData.userName} />
			<Userbar name={jsonData.userName}/>
			<MatchHistory />
		</div> 				
	)
}

export default ProfilePage;