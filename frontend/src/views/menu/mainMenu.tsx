import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './home.css'
import MatchMakingButton from "../../hooks/matchMaking/matchMakingButton"

function NavButton({label}) {
	const navigate = useNavigate();

	function handleClick() {
		navigate('/'.concat(label));
	}

	return (
		<button
			className="button"
			type="button"
			onClick={handleClick}>{label}</button>
	)
}

const Menu = () => {
	const [activeMenu, setActiveMenu] = useState('home');
	
	const mainMenu = () => {
		return (
			<div className='menu'>
				<p className='text'>BALL BUSTERS</p>
				<button className='button' onClick={() =>setActiveMenu('play')}>play</button>
				<NavButton label={'profile'} />
				<NavButton label={'settings'} />
				<button className='button'>pointless</button>
			</div>
		)
	}

	const playMenu = () => {
		//TODO: rename gamemodes, and connect to matchmaking.
		return (
			<div className='menu'>
				<p className='text'>GAMEMODE</p>
				<NavButton label={'playpong'} />
				<NavButton label={'gamemode2'} />
				{/* <button className='button'>gamemode1</button>
				<button className='button'>gamemode2</button> */}
				<button className='button' onClick={() =>setActiveMenu('home')}>return</button>
			</div>
		)
	}

	const renderMenu = () => {
		switch (activeMenu) {
			case 'home':
				return mainMenu();
			case 'play':
				return playMenu();
			default:
				return null;
		}
	};

	return (
		<div className='menu'>
			{renderMenu()}
		</div>
	);
};

export default Menu;