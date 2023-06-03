import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import MyNavBar from "../../hooks/navbar/navbar";
import MyFriendsList from "../profile/flexbox/friendlist/friendlist";

function NavButton({label}) {
	const navigate = useNavigate();

	function handleClick() {
		navigate('/'.concat(label));
	}

	return (
		<button
			className="button"
			type="button"
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
			<NavButton label='profile' />
    	</div>
  );
}

export default SettingsPage;