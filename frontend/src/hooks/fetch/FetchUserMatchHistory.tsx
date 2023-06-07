import { Constants } from "../../../../shared/constants";

async function FetchMatchHistory({username} : {username:string}) {
	const res = await fetch(`${Constants.FETCH_SELF}/matches`, {
		credentials: 'include'
	});
	if (!res.ok || res.status == 401)
	{
		console.log("something wrong redirect to login");
		return false;
	}
	const jsonData = await res.json();
	return jsonData;
}

export default FetchMatchHistory