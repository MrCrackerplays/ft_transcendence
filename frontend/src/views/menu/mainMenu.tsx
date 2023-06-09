import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './home.css'

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
				<button className='button'>extras</button>
			</div>
		)
	}

	const playMenu = () => {
		return (
			<div className='menu'>
				<p className='text'>GAMEMODE</p>
				<button className='button'>gamemode 1</button>
				<button className='button'>gamemode 2</button>
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