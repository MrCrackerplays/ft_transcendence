import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { Socket, io } from "socket.io-client";
import { Constants } from '../../../../shared/constants';
import './home.css'
import TestMatchMakingConnection from '../profile/matchMaking/gamequeue';
import MatchMakingQueue from '../profile/matchMaking/gamequeue';

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

async function grantPointless()
{
	const RESPONSE2 = await fetch(`${Constants.BACKEND_URL}/self/achievements`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'content-type': "application/json"
		},
		body: JSON.stringify({
			name: "pointless"
		})
	});
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
				<button className='button' onClick={() =>grantPointless()}>pointless</button>
			</div>
		)
	}

	const playMenu = () => {
		//TODO: rename gamemodes if need be.
		return (
			<div className='menu'>
				<p className='text'>GAMEMODE</p>
				<NavButton label={'classic'} />
				<NavButton label={'solo'} />
				<button className='button' onClick={() => {
					setActiveMenu('home')
				}}>return</button>
			</div>
		)
	}

	const matchQueue = (gamemode: string) => {
		console.log(`gamemode = ${gamemode}`);
		return (
			<div className='menu'>
				<MatchMakingQueue gamemode={gamemode}/>
				<button className='button' onClick={() => {
					setActiveMenu('home');
				}}>Cancel</button>
			</div>
		)
	}

	const renderMenu = () => {
		switch (activeMenu) {
			case 'home':
				return mainMenu();
			case 'play':
				return playMenu();
			case 'classicQueue':
				return matchQueue('classic');
			case 'soloQueue':
				return matchQueue('solo');
			default:
				return mainMenu();
		}
	};

	return (
		<div className='menu'>
			{renderMenu()}
		</div>
	);
};

export default Menu;