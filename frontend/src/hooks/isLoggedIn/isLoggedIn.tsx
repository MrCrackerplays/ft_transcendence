import { Constants } from "../../../../shared/constants";

async function isLoggedIn()
{
	let isLogin = await fetch(`${Constants.BACKEND_URL}/self`, {
		credentials: 'include'
		});
	if (!isLogin.ok)
		return (false)
	return (true)
}

export default isLoggedIn;