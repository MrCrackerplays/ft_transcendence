import { Constants } from "../../../../shared/constants"

async function FetchSelf() {

	const res = await fetch(Constants.FETCH_SELF, {
		credentials: 'include'
	});
	if (!res.ok || res.status == 401) 
	{
		console.log("something wrong redirect to login");
		return false
	}
	const jsonData = await res.json();
	// console.log(`User Score: ${jsonData.score}, User active: ${jsonData.active}`);
	return jsonData;
}

export default FetchSelf