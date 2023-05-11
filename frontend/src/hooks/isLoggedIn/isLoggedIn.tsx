import Cookies from 'js-cookie'
import { useEffect, useState } from "react";

function isLoggedIn()
{
	const [isLogin, setLogin] = useState(0);

	useEffect(() => {
		async function checkLogin() {
			const res = await fetch('http://localhost:3000/', {
					credentials: 'include'
				});
			setLogin(res.status);
			// console.log(value)

		}
		checkLogin();
	}, []);

	if (isLogin == 200)
		return (true);
	else
		return (false);
}

export default isLoggedIn