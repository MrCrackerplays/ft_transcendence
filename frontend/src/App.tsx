import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useNavigate  } from 'react-router-dom'
import ProfilePage from './views/profile/profile';
import MySettingsPage from './views/settings/settings'
import MyLoginPage from './views/login/login';
import Temp from './views/profile/temp/temp';
import isLoggedIn from './hooks/isLoggedIn/isLoggedIn'
import { useEffect, useState } from 'react'

// const PrivateRoutes = () => {
// 	const isLogin = isLoggedIn();

// 	console.log(isLogin)
// 	return (
//     	isLogin ? <Outlet/> : <Navigate to='/login'/>
// 		)
// }

function PrivateRoutes() {
	const navigate = useNavigate();
  
	useEffect(() => {
	  async function checkLogin() {
		const loggedIn = await isLoggedIn();
		if (!loggedIn) {
		  navigate("/login"); // Redirect to the login page if not logged in
		}
	  }
	  checkLogin();
	}, [navigate]);
  
	return <Outlet />;
  };
  
// function App() {
// 	return (
// 	  <Router>
// 		  <Routes>
// 			<Route element={<PrivateRoutes/>}>
// 				<Route path='/' element={<Users/>} />
// 				<Route path='/products' element={<Products/>} />
// 			</Route>
// 			<Route path='/login' element={<Login/>}/>
// 		  </Routes>
// 	  </Router>
// 	);
//   }
function App(): React.ReactElement
{
  return (
    <div className="App">
		<Router>
    		<Routes>
				<Route element={<PrivateRoutes/>}>	
					<Route path="/" element={<ProfilePage />} />
					<Route path="/profile/*" element={<ProfilePage />} />
    				<Route path="/setting" element={<ProfilePage />} />
					<Route path="/temp" element={<Temp />}/>
				</Route>
				<Route path="/login" element={<MyLoginPage />} />
    		</Routes>
		</Router>
    </div>
  );
}
export default App	