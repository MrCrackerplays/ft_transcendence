async function isLoggedIn()
{
	let isLogin = await fetch('http://localhost:3000/self', {
		credentials: 'include'
		});
	if (!isLogin.ok)
		return (500)
	return (isLogin.status)
}

export default isLoggedIn;