import React, {useEffect, useState} from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import QueryTest from "./mainstats";
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import MyAchievement from '../profile/matchhistory';
import MyMatchHistory from '../profile/matchhistory';
import isLoggedIn from '../../hooks/isLoggedIn/isLoggedIn';

const queryClient = new QueryClient();

function MyHomePage()
{
  const [loginChecked, setLoginChecked] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const loggedIn = await isLoggedIn();
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
        <QueryClientProvider client={queryClient}>
            <QueryTest />
        </QueryClientProvider>
        <MyMatchHistory />
      </div>
      ) : (
        <></>
      )
    } 
    </>
  )
}

export default MyHomePage;