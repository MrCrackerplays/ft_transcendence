import { Constants } from "../../../../shared/constants"

async function FetchSelf() {

	const res = await fetch(Constants.FETCH_SELF, {
		credentials: 'include'
	});
	if (!res.ok || res.status == 401) 
	{
		return false
	}
	const jsonData = await res.json();
	return jsonData;
}

export default FetchSelf