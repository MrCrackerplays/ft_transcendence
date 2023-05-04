import Cookies from 'js-cookie'
import { useEffect } from "react";

async function isLoggedIn()
{
	const res = await fetch('http://localhost:3000/', {
		credentials: 'include'
	});

	console.log(res.status);

	if (res.status == 200)
	{
		console.log("We got a request")
		return (true)
	}
	else
	{
		console.log("couldn't get cookie value, redirecting");
		window.location.replace("http://localhost:5173/login");
		return (false)
	}
}

export default isLoggedIn