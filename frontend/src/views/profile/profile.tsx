import React, {useEffect, useState} from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import QueryTest from "./mainstats";
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import isLoggedIn from '../../hooks/isLoggedIn/isLoggedIn';
import MatchHistory from './components/matchhistory/matchhistory';
import Userbar from './components/userbar/userbar';
const queryClient = new QueryClient();
function printToken()
{
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  console.log(code);
}

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
        {/* <MatchHistory /> */}
      </div>
      ) : (
        <></>
      )
    } 
    </>
  )
}

export default ProfilePage;