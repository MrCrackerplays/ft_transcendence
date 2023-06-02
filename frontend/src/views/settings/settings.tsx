import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import MyNavBar from "../../hooks/navbar/navbar";
import muteImg from './mute.png'
import unmuteImg from './unmute.png'
import MyFriendsList from "../profile/flexbox/friendlist/friendlist";

function NavButton({label}) {
	const navigate = useNavigate();

	function handleClick() {
		navigate('/'.concat(label));
	}

	return (
		<button
			className="button"
			onClick={handleClick}>
				<p className="text">{label}</p>
		</button>
	)
}

function SettingsPage()
{
	const [jsonData, setJsonData] = useState([] as any);
	return (
    	<div>
    		{/* <MyNavBar name={jsonData.userName} imgsrc={jsonData.imageURL}/> */}
			<NavButton label='profile' />
    	</div>
  );
}

export default SettingsPage;