async function isLoggedIn()
{
	let isLogin = await fetch('http://localhost:3000/self', {
		credentials: 'include'
		});
	if (!isLogin.ok)
		return (false)
	return (true)
}

export default isLoggedIn;