import React, {useEffect, useState} from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import QueryTest from "./mainstats";
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import isLoggedIn from '../../hooks/isLoggedIn/isLoggedIn';
import MatchHistory from './flexbox/matchhistory/matchhistory';
import Userbar from './flexbox/userbar/userbar';
import FetchSelf from '../../hooks/fetch/FetchSelf';
const queryClient = new QueryClient();

function ProfilePage()
{
	const [loginChecked, setLoginChecked] = useState(false);
	const [jsonData, setJsonData] = useState([] as any);
	
	useEffect(() => {
    async function checkLogin() {
    	const loggedIn = await isLoggedIn();
    	if (loggedIn == true)
    	{
    		setLoginChecked(true);
    		const value = await FetchSelf();
    		if (value)
				setJsonData(value);
    	}
    }
    checkLogin();
  }, []);
  
	console.log(jsonData)
	return(
		<>
		{
			loginChecked ? (
				<div>
					<MyNavBar name={jsonData.userName} imgsrc={"http://localhost:3000/self/pfp"} />
					<Userbar name={jsonData.userName}/>
					<MatchHistory />
				</div> 				
				) : (<></>)
		} 
		</>
	)
}

export default ProfilePage;