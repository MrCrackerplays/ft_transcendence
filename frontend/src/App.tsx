import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useNavigate, redirect  } from 'react-router-dom'
import ProfilePage from './views/profile/profile';
import MySettingsPage from './views/settings/settings'
import MyLoginPage from './views/login/login';
import Temp from './views/profile/temp/temp';
import isLoggedIn from './hooks/isLoggedIn/isLoggedIn'
import { useEffect, useState } from 'react'

function App(): React.ReactElement
{
	const [isLoading, setIsLoading] = useState(true)
	const [isLogged, setLogged] = useState(false)
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			const data = await isLoggedIn()
			if (data >= 200 && data <= 299)
				setLogged(true)
			else
				navigate("/login");
			setIsLoading(false)	
		}
		fetchData();
	}, [])
	if (isLoading)
	  return (<div> </div>);
	return (
    <div className="App">
    		<Routes>
				<Route path="/" element={<ProfilePage />} />
				<Route path="/profile/*" element={<ProfilePage />} />
    			<Route path="/setting" element={<ProfilePage />} />
				<Route path="/temp" element={<Temp />}/>
				<Route path="/login" element={<MyLoginPage />}/>
    		</Routes>
    </div>
  );
}
export default App	