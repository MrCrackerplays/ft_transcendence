import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ProfilePage from './views/profile/profile';
import MySettingsPage from './views/settings/settings'
import MyLoginPage from './views/login/login';
import Temp from './views/profile/temp/temp';
import isLoggedIn from './hooks/isLoggedIn/isLoggedIn'
import LoginOTP from './views/loginotp/loginotp';
import SetUp from './views/newuser/newuser';
import { useEffect, useState } from 'react'
import MyNavBar from './hooks/navbar/navbar';
import MyFriendsList from './views/profile/flexbox/friendlist/friendlist';
import SettingsPage from './views/settings/settings';

function App(): React.ReactElement
{
	const [isLoading, setIsLoading] = useState(true)
	const [isVerified, setIsVerified] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			const data = await isLoggedIn();
			if (!(data >= 200 && data <= 299))
				navigate("/login");
			else
				setIsVerified(true);
			setIsLoading(false);
		}
		if (location.pathname !== "/login" && location.pathname !== "/loginOTP" && location.pathname !== "/setup")
			fetchData();
		else
			setIsLoading(false);
	}, [location])
	if (isLoading)
		return (<div> </div>);
	if (!isVerified)
		return (
				<Routes>
					<Route path="/login" element={<MyLoginPage />}/>
					<Route path="/loginOTP" element={<LoginOTP />}/>
					<Route path="/setup" element={<SetUp />} />
				</Routes>
		)
	return (
		<div>
			<MyNavBar/>
			<MyFriendsList />
    		<Routes>
				<Route path="/" element={<ProfilePage />}/>
				<Route path="/profile/*" element={<ProfilePage />} />
    			<Route path="/settings" element={<SettingsPage />} />
				<Route path="/temp" element={<Temp />}/>
    		</Routes>
		</div>
  );
}
export default App	