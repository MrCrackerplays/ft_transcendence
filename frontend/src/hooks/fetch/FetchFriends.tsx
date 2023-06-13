import { Constants } from "../../../../shared/constants"

async function FetchFriends() {

	const res = await fetch(`${Constants.FETCH_SELF}/friends`, {
		credentials: 'include'
	});
	if (!res.ok || res.status == 401) 
	{
		console.log("something wrong redirect to login");
		return false
	}
	// console.log(js);
	const jsonData = await res.json();
	// console.log(jsonData);
	// console.log(`User Score: ${jsonData.score}, User active: ${jsonData.active}`);
	return jsonData;
}

export default FetchFriends