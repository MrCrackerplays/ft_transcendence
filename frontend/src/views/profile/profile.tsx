import React, {useEffect, useState} from 'react';
import MatchHistory from './flexbox/matchhistory/matchhistory';
import Userbar from './flexbox/userbar/userbar';
import FetchSelf from '../../hooks/fetch/FetchSelf';
import FetchUser from '../../hooks/fetch/FetchUser';
import { Constants } from "../../../../shared/constants";
import DefaultProfile, { PublicUser} from '../../../../shared/public-user';
import { useLocation } from 'react-router-dom';

import './profile.css'
function ProfilePage()
{
	const [loginChecked, setLoginChecked] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [jsonData, setJsonData] = useState<PublicUser>(DefaultProfile());
	const profile = useLocation().pathname.replace("/profile", "")
	const link = Constants.FETCH_SELF_PFP;
	
	useEffect(() => {
		async function checkLogin() {
			if (profile.length == 0 || profile.length == 1)
				setJsonData(await FetchSelf())
			else
				setJsonData(await FetchUser(profile))
			setIsLoading(false);
    	}
    checkLogin();
	}, []);

	if (isLoading)
		return (<div />);
	if (!jsonData)
	{
		console.log("return no user");	
		return (<div/>)
	}
	return(
		<div className="profilebox">
			<Userbar name={jsonData.userName}/>
			{/* <img */}
			<MatchHistory />
		</div> 				
	)
}

export default ProfilePage;