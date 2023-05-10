import React, {useEffect, useState} from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import QueryTest from "./mainstats";
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import isLoggedIn from '../../hooks/isLoggedIn/isLoggedIn';
import MatchHistory from './components/matchhistory/matchhistory';
import Userbar from './components/userbar/userbar';
import FetchSelf from '../../hooks/fetch/fetchSelf';
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
  
  async function handleSubmit() {
	window.event?.preventDefault();
    const data = await FetchSelf()
    if (!data.ok)
    	return (false)
	// console.log(data.id)
	const p2ID2 = "32788b79-b4b3-4b23-ba5b-9d1a58551b0d"
    const RESPONSE = await fetch("http://localhost:3000/matches", {
    	method: 'POST',
    	credentials: 'include',
		headers: {
			'content-type': "application/json"
		},
		body: JSON.stringify({
				p1ID: data.id,
				p2ID: p2ID2,
				p1Score:10,
				p2Score:5,
				winner: 0
		})
	});
	    	// body: `'{"p1ID":"${data.id}","p2ID":"${p2ID2}","p1Score":5,"p2Score":10,"winner":1}'`
  }

	// giveMedata();
  
  return(
    <>
    {
      loginChecked ? (
        <div>
        <MyNavBar />
        <QueryClientProvider client={queryClient}>
            <QueryTest />
        </QueryClientProvider>
        <Userbar name="znajda"/>
        <form onSubmit={handleSubmit}>
        <button className="btn-temp">
          Post Request!
        </button>
        </form>
        <MatchHistory />
      </div>
      ) : (
        <></>
      )
    } 
    </>
  )
}

export default ProfilePage;