import { Constants } from "../../../../shared/constants"

async function FetchUser( user:string) 
{
	const res = await fetch(`${Constants.FETCH_USERS}${user}`, {
		credentials: 'include'
	});
	console.log(`"${Constants.FETCH_USERS}${user}"`)
	if (!res.ok || res.status == 401)
	{
		console.log("change how to get here");
		return (false);
	}
	const jsonData = await res.json();
	return (jsonData);
}

export default FetchUser