import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import MyNavBar from "../../hooks/navbar/navbar";
import MyFriendsList from "../sidebar/friendlist/friendlist";
import './settings.css'

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

function subMenu()
{
	const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

	const handleSubMenuToggle = () => {
		setIsSubMenuOpen(isSubMenuOpen);
	}

	return (
		<ul className='menu'>
			<p className='text'>BALLBUSTERS</p>
			<NavButton label='profile' />
			<NavButton label='extras' />
			<button
				className="button"
				type="button"
				onClick={handleSubMenuToggle}>
					<p className="text">return</p>
			</button> { isSubMenuOpen && <subMenu />}
    	</ul>
	)
}

function SettingsPage()
{
	const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

	const handleSubMenuToggle = () => {
		setIsSubMenuOpen(isSubMenuOpen);
	}
	return (
    	<ul className='menu'>
			<p className='text'>BALLBUSTERS</p>
			<button
				className="button"
				type="button"
				onClick={handleSubMenuToggle}>
					<p className="text">play</p>
			</button> { isSubMenuOpen && <subMenu />}
			<NavButton label='profile' />
			<NavButton label='extras' />
    	</ul>
	)
}

export default SettingsPage;