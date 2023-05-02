import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MyHomePage from './views/home/home'
import MySettingsPage from './views/settings/settings'
import MyLoginPage from './views/login/login';

function App()
{
  return (
    <div className="App">
		<Router>
    		<Routes>
    			<Route path="/" Component={MyHomePage} />
    			<Route path="/setting" Component={MySettingsPage} />
				<Route path="/login" Component={MyLoginPage} />
    		</Routes>
		</Router>
    </div>
  );
}

export default App