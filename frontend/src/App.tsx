import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ProfilePage from './views/profile/profile';
import MyLoginPage from './views/login/login';
import isLoggedIn from './hooks/isLoggedIn/isLoggedIn'
import LoginOTP from './views/loginotp/loginotp';
import SetUp from './views/newuser/newuser';
import { useEffect, useState } from 'react'
import MyNavBar from './hooks/navbar/navbar';
import HomePage from './views/menu/home';

import UserStatus from './hooks/userStatus/userStatus';
import Sidebar from './views/sidebar/sidebar';
import './App.css'
import Settings from './views/settings/settings';
import LoggedInMissing, { NotLoggedInMissing } from './views/missing/allmissing';
import TestMatchMakingConnection from './views/matchMaking/gamequeue';
import MatchMakingQueue from './views/matchMaking/gamequeue';
import PongGame from './hooks/game/pong';
import GameInvite from './views/matchMaking/invite/gameInvite';
import { GameMode } from '../../shared/pongTypes';

function App(): React.ReactElement
{
	const [isLoading, setIsLoading] = useState(true)
	const [isVerified, setIsVerified] = useState(false);
	const [updatescam, setupdatescam] = useState(0);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			const data = await isLoggedIn();
			if (!data)
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
				<Route path="/*" element={<NotLoggedInMissing />}/>
			</Routes>
		)
	return (
		<div id="loggedincontainer">
			<MyNavBar updatescam={updatescam}/>
			<Sidebar />
			<UserStatus />
			<div className="maincontainer scrollable">
				<Routes>
					<Route path="/" element={<HomePage />}/>
					<Route path="/profile/*" element={<ProfilePage />} />
					<Route path="/settings" element={<Settings updatescam={updatescam} setupdatescam={setupdatescam}/>}/>
					<Route path="/classic" element={<MatchMakingQueue gamemode={GameMode.CLASSIC}/>} />
					<Route path="/solo" element={<MatchMakingQueue gamemode={GameMode.SOLO}/>} />
					<Route path="/private/*" element={<GameInvite gamemode={GameMode.INVITE}/>} />
					{/* <Route path="/solo" element={<PongGame gamemode='solo'/>} /> */}
					<Route path="/*" element={<LoggedInMissing/>}/>
				</Routes>
			</div>
		</div>
  );
}

export default App	