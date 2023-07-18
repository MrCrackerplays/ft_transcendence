import { Constants } from "../../../../shared/constants"

async function FetchUser( user:string) 
{
	const res = await fetch(`${Constants.FETCH_USERS}${user}`, {
		credentials: 'include'
	});
	if (!res.ok || res.status == 401)
	{
		return (false);
	}
	const jsonData = await res.json();
	return (jsonData);
}

export default FetchUser