import React from 'react';
// import PublicUser from 'shared/public-user.ts'
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import './home.css'
  
  type UserData = {
	userName: string;
	score: number;
	active: boolean;
	imageURL: string;
  }
  function QueryTest() {
	// Fetcher function
	async function getData() {
		const res = await fetch('http://localhost:3000/users', {
			credentials: 'include'
		});
		if (!res.ok)
			console.log("something wrong")
		const jsonData = await res.json();
		return jsonData;
	}
	// Using the hook
	const {data, error, isLoading} = useQuery('randomFacts', getData);

	// Error and Loading states
	if (error) return <div>Request Failed</div>;
	if (isLoading) return <div>Loading...</div>;
	// Show the response if everything is fine
	return (
		<div className="main-stats">
			<img src={data.imageURL} alt="This is a PFP" width={200} height={200}/>
			<h1>{data.userName}</h1>
			<p>Score: {data.score}</p>
			<p>Active: {data.active}</p>
		</div>
	);
}

export default QueryTest
