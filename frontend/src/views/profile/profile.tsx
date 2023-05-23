import React, {useEffect, useState} from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import MatchHistory from './flexbox/matchhistory/matchhistory';
import Userbar from './flexbox/userbar/userbar';
import FetchSelf from '../../hooks/fetch/FetchSelf';

function ProfilePage()
{
	const [loginChecked, setLoginChecked] = useState(false);
	const [jsonData, setJsonData] = useState([] as any);
	
	useEffect(() => {
		async function checkLogin() {
    		const value = await FetchSelf();
    		if (value)
				setJsonData(value);
    	}
    checkLogin();
	}, []);
  
	console.log(jsonData)
	return(
		<div>
			<MyNavBar name={jsonData.userName} imgsrc={jsonData.imageURL} />
			<Userbar name={jsonData.userName}/>
			<MatchHistory />
		</div> 				
	)
}

export default ProfilePage;