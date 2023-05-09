import React, {useEffect, useState} from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
// import QueryTest from "./mainstats";
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import isLoggedIn from '../../hooks/isLoggedIn/isLoggedIn';
import MatchHistory from './components/matchhistory/matchhistory';
import Userbar from './components/userbar/userbar';
import FriendList from './components/friendlist/friendlist'
const queryClient = new QueryClient();

function ProfilePage()
{
  const [loginChecked, setLoginChecked] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const loggedIn = await isLoggedIn();
      if (loggedIn == true)
        setLoginChecked(true);
    }
    checkLogin();
  }, []);

  	async function giveMedata() {

		const res = await fetch('http://localhost:3000/users/self', {
			credentials: 'include'
		});
		if (!res.ok)
			console.log("something wrong");
		const jsonData = await res.json();
		console.log(`User Score: ${jsonData.score}, User active: ${jsonData.active}`);
		return jsonData;
	}

	giveMedata();
  
  return(
    <>
    {
      loginChecked ? (
    	<div>
        <MyNavBar />
        {/* <QueryClientProvider client={queryClient}>
            <QueryTest />
			</QueryClientProvider>
			<Userbar name="znajda"/> */}
    	<MatchHistory />
		<FriendList />
      </div>
      ) : (
        <></>
      )
    } 
    </>
  )
}

export default ProfilePage;