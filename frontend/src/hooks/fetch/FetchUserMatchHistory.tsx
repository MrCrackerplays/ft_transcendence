import { Constants } from "../../../../shared/constants";

async function FetchUserMatchHistory(username) {
	const res = await fetch(`${Constants.FETCH_USERS}/${username}/matches`, {
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

export default FetchUserMatchHistory