import { Constants } from "../../../../shared/constants"

async function FetchFriends() {

	const res = await fetch(`${Constants.FETCH_SELF}/friends`, {
		credentials: 'include'
	});
	if (!res.ok || res.status == 401) 
		return false
	const jsonData = await res.json();
	return jsonData;
}

export default FetchFriends