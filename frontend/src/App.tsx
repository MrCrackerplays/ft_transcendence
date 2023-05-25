import {Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ProfilePage from './views/profile/profile';
import MySettingsPage from './views/settings/settings'
import MyLoginPage from './views/login/login';
import Temp from './views/profile/temp/temp';
import isLoggedIn from './hooks/isLoggedIn/isLoggedIn'
import LoginOTP from './views/loginotp/loginotp';
import { useEffect, useState } from 'react'

function App(): React.ReactElement
{
	const [isLoading, setIsLoading] = useState(true)
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			const data = await isLoggedIn();
			if (!(data >= 200 && data <= 299))
				navigate("/login");
			setIsLoading(false);
		}
		if (location.pathname !== "/login" && location.pathname !== "/loginOTP")
			fetchData();
		else
			setIsLoading(false);
	}, [location])
	if (isLoading)
	  return (<div> </div>);
	return (
    	<Routes>
			<Route path="/" element={<ProfilePage />} />
			<Route path="/profile/*" element={<ProfilePage />} />
    		<Route path="/setting" element={<ProfilePage />} />
			<Route path="/temp" element={<Temp />}/>
			<Route path="/login" element={<MyLoginPage />}/>
			<Route path="/loginOTP" element={<LoginOTP />}/>
    	</Routes>
  );
}
export default App	