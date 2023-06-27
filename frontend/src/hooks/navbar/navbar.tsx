import MyPopover from "./play";
import './navbar.css'
import { useEffect, useState } from "react";
import FetchSelf from "../fetch/FetchSelf";
import DefaultProfile, { PublicUser } from '../../../../shared/public-user';
import { Constants } from "../../../../shared/constants";

function MyNavBar({updatescam})
{
	const [profile, setProfile] = useState<PublicUser>(DefaultProfile());
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function getSelf() {
			setProfile(await FetchSelf())
			setIsLoading(false)
    	}
    getSelf();
	},[updatescam]);
	if (isLoading)
		return (<div />);
	return (
		<div className="my-navbar">
			<p className="website">Ball Busters</p>
			<MyPopover key={updatescam} name={profile.userName} imgsrc={Constants.FETCH_SELF_PFP}/>
		</div>
	)
}

export default MyNavBar