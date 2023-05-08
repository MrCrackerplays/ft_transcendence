import React from 'react';
import { Router, redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import * as Constants from "../../../../shared/constants";
import './login.css'

function MyLoginPage()
{
  const link = Constants.BACKEND_LOGIN_REDIRECT
  return (
    <div className="login">
		  <h1 className="text"> So, You're Trying to Roll into Ball Busters huh?</h1>
      <a href={link} className="aBtn">Log in</a>
	</div>
  );
}

export default MyLoginPage;