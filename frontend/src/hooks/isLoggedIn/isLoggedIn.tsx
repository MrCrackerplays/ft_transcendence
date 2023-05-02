import Cookies from 'js-cookie'
import { useEffect } from "react";

function isLoggedIn()
{
	const cookieName = "Authentication="
	const cookieValue = Cookies.get(cookieName)

	if (cookieValue)
	{
		console.log(cookieValue)
		window.location.replace("http://localhost:5173/")
		return (true)
	}
	else
	{
		window.location.replace("http://localhost:5173/login");
		return (false)
	}
	return (false)
}

export default isLoggedIn