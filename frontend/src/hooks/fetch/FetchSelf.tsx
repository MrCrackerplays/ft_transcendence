async function FetchSelf() {

	const res = await fetch('http://localhost:3000/self', {
		credentials: 'include'
	});
	if (!res.ok)
	{
		console.log("something wrong");
		return false
	}
	const jsonData = await res.json();
	// console.log(`User Score: ${jsonData.score}, User active: ${jsonData.active}`);
	return jsonData;
}

export default FetchSelf