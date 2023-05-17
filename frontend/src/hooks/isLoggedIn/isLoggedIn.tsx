import Cookies from 'js-cookie'
import { useEffect, useState } from "react";


async function isLoggedIn()
{
	let isLogin = await fetch('http://localhost:3000/self', {
							credentials: 'include'
						});
	if (isLogin.status == 200)
						return (true);
					return(false);
}

// async function isLoggedIn()
// {
// 	const [isLogin, setLogin] = useState(0);

// 	useEffect(() => {
// 		async function checkLogin() {
// 			const res = await fetch('http://localhost:3000/self', {
// 					credentials: 'include'
// 				});
// 			console.log(res.status)
// 			setLogin(res.status);
// 		}
// 		checkLogin();
// 	}, []);

// 	// return (true)
// 	if (isLogin == 200)
// 		return (true);
// 	else
// 		return (false);
// }

// export default isLoggedIn

// import { useEffect, useState } from "react";

// const useLoggedIn = () => {
// 	const [isLogin, setLogin] = useState(0);
// 	useEffect(() => {
// 		async function checkLogin() {
// 			const res = await fetch('http://localhost:3000/self', {
// 						credentials: 'include'
// 					});
// 		console.log(res.status)
//   		setLogin(res.status);
//   		// console.log(res.status)	
//   		// console.log(isLogin)
// 	}
// 	checkLogin();
// }, []);
// 	console.log(isLogin)
// 	if (isLogin == 200)
// 		return (true);
// 	return (false);
// };

export default isLoggedIn;