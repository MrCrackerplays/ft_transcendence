import { Constants } from "../../../../shared/constants"

async function FetchQREnabled() {

	const res = await fetch(`${Constants.BACKEND_URL}/2fa/enabled`, {
		credentials: 'include'
	});
	if (!res.ok || res.status == 401) 
		return false;
	return (res.bodyUsed);
	// return true;
		// return jsonData;
}

export default FetchQREnabled