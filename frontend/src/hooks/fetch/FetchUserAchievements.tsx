import { Constants } from "../../../../shared/constants";

async function FetchUserAcheivements(username) {
	const res = await fetch(`${Constants.FETCH_USERS}/${username}/achievements`, {
		credentials: 'include'
	});
	if (!res.ok || res.status == 401)
	{
		return false;
	}
	const jsonData = await res.json();
	return jsonData;
}

export default FetchUserAcheivements