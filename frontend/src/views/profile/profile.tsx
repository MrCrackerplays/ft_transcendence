import React, {useEffect, useState} from 'react';
import MyNavBar from "../../hooks/navbar/navbar";
import MatchHistory from './flexbox/matchhistory/matchhistory';
import Userbar from './flexbox/userbar/userbar';
import FetchSelf from '../../hooks/fetch/FetchSelf';
import { Constants } from "../../../../shared/constants";
import { useLocation } from 'react-router-dom';

function ProfilePage()
{
	const [loginChecked, setLoginChecked] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [jsonData, setJsonData] = useState([] as any);
	const profile = useLocation().pathname.replace("/profile", "")
	const link = Constants.FETCH_SELF_PFP;
	
	useEffect(() => {
		async function checkLogin() {
			let value;
			if (profile.length == (0 || 1))
				value = await FetchSelf()
			else
				value = await FetchUser(profile)
			setIsLoading(false);
    	}
    checkLogin();
	}, []);
	if (isLoading)
		return (<div />);
	console.log(profile);	
	return(
		<div>
			<MyNavBar name={jsonData.userName} imgsrc={link} />
			<Userbar name={jsonData.userName}/>
			<MatchHistory />
		</div> 				
	)
}

export default ProfilePage;