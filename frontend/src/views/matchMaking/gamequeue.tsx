import React, { useEffect, useRef, useState, MutableRefObject } from "react";
import { useNavigate } from 'react-router-dom';
import { Socket, io } from "socket.io-client";
import { Constants } from "../../../../shared/constants";
import '../menu/home.css';
import './gamequeue.css'
import PongGame from "../../hooks/game/pong";

function HomeButton({label}) {
	const navigate = useNavigate();

	function handleClick() {
		navigate('/');
	}

	return (
		<button className="button" onClick={() => handleClick()}>{label}</button>
	)
}

function MatchMakingQueue(gamemode: {gamemode: string}) {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const [activeGame, setActiveGame] = useState(false);
	const [gameOver, setGameOver] = useState(false);
	const [victory, setVictory] = useState('');
	const ws: MutableRefObject<Socket | undefined> = useRef<Socket>();

	useEffect(() => {
		if (!ws.current) {
			ws.current = io(`${Constants.BACKEND_URL}/matchMakingGateway`, {withCredentials: true});
		}
		else if (ws.current.disconnected) {
			ws.current.connect();
		}

		ws.current.on('new_connection', () => {
			ws.current?.emit("join_queue", gamemode.gamemode); //was gamemode as object, needed as string
			setIsConnectionOpen(true);
		});

		ws.current.on('disconnect', () => {
			setActiveGame(false);
			setIsConnectionOpen(false);
		});

		ws.current.on('joined_queue', () => {
		});

		ws.current.on('start_game', () => {
			setActiveGame(true);
		});

		ws.current.on('victory', () => {
			setVictory('victory');
		});

		ws.current.on('defeat', () => {
			setVictory('defeat');
		});
		
		ws.current.on('end_game', (victory: Boolean) => {
			setActiveGame(false);
			setGameOver(true);
		});

		return () => {
			ws.current?.close();
		}
	}, []);

	const renderGame = () => {
		switch (activeGame) {
			case false:
				if (!gameOver) {
					return (
						<div  className="menu">
							<p className="text">Waiting for opponent...</p>
							<HomeButton label={'cancel'}></HomeButton>
						</div>
					)
				}
				else {
					switch (victory) {
						case 'victory':
							return (
								<div  className="menu">
									<p className="victory">VICTORY!</p>
									<HomeButton label={'return'}></HomeButton>
								</div>
							)
						case 'defeat':
							return (
								<div  className="menu">
									<p className="defeat">DEFEAT!</p>
									<HomeButton label={'return'}></HomeButton>
								</div>
							)
						default :
							return (
								<div  className="menu">
									<p className="text">End of Game.</p>
									<HomeButton label={'return'}></HomeButton>
								</div>
							)
					}
				}
			case true:
				return (
					<div> 
						{/* <p className="text">Game is starting...</p> */}
						<PongGame webSocketRef={ws} gamemode={gamemode}/>
					</div>
				)
		}
	}

	return (
		<div>
			{renderGame()}
		</div>
	)

	
}

export default MatchMakingQueue;