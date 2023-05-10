import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ProfilePage from './views/profile/profile';
import MySettingsPage from './views/settings/settings'
import MyLoginPage from './views/login/login';
import Temp from './views/profile/temp/temp';

function App()
{
  return (
    <div className="App">
		<Router>
    		<Routes>
				<Route path="/" />
    			<Route path="/profile/*" Component={ProfilePage} />
    			<Route path="/setting" Component={MySettingsPage} />
				<Route path="/login" Component={MyLoginPage} />
				<Route path="/temp" Component={Temp} />
    		</Routes>
		</Router>
    </div>
  );
}

export default App