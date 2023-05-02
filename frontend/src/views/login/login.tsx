import React from 'react';
import { Router, redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import './login.css'

function MyLoginPage() {
  const link = "http://localhost:3000/login"
  return (
    <div className="login">
		  <h1 className="text"> So, You're Trying to Log in huh?</h1>
      <a href={link} className="aBtn">Log in</a>
	</div>
  );
}

export default MyLoginPage;