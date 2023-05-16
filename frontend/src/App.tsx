import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import ProfilePage from './views/profile/profile';
import MySettingsPage from './views/settings/settings'
import MyLoginPage from './views/login/login';
import Temp from './views/profile/temp/temp';
import isLoggedIn from './hooks/isLoggedIn/isLoggedIn'

const PrivateRoute = ({component: Component, ...rest}) => {
    return (

        // Show the component only when the user is logged in
        // Otherwise, redirect the user to /signin page
        <Route {...rest} render={props => (
            isLoggedIn() ?
                <Component {...props} />
            : <Navigate to="/login" />
        )} />
    );
};

function App(): React.ReactElement
{
  return (
    <div className="App">
		<Router>
			<h1>Tet</h1>
    		<Routes>
				<PrivateRoute path="/" Component={ProfilePage}/>
				<PrivateRoute path="/profile/*" Component={ProfilePage}/>
    			<Route path="/setting" component={ProfilePage} />
				<Route path="/login" element={<MyLoginPage />} />
				<Route path="/temp" element={<Temp />}/>
    		</Routes>
		</Router>
    </div>
  );
}

export default App	