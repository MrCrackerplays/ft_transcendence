import React, { useEffect, useRef, useState, MutableRefObject } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Socket, io } from "socket.io-client";
import { Constants } from "../../../../../shared/constants";
import '../../menu/home.css';
import '../matchmaking.css'
import PongGame from "../../../hooks/game/pong";
import { GameMode } from "../../../../../shared/pongTypes";

function HomeButton({label}) {
	const navigate = useNavigate();

	function handleClick() {
		navigate('/');
	}

	return (
		<button className="button" onClick={() => handleClick()}>{label}</button>
	)
}

function GameInvite(gamemode: {gamemode: string}) {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const [activeGame, setActiveGame] = useState(false);
	const [gameOver, setGameOver] = useState(false);
	const [victory, setVictory] = useState('');
	const url = useLocation().pathname.replace("/private/", "")
	const ws: MutableRefObject<Socket | undefined> = useRef<Socket>();

	useEffect(() => {
		if (!ws.current) {
			// console.log(`${Constants.BACKEND_URL}/matchMakingGateway`);
			ws.current = io(`${Constants.BACKEND_URL}/matchMakingGateway`, {withCredentials: true});
			console.log('new socket established');
		}
		else if (ws.current.disconnected) {
			ws.current.connect();
			console.log('connect with current socket');
		}

		ws.current.on('new_connection', () => {
			console.log(`connection established ${ws.current?.id}`);
			ws.current?.emit("join_queue", `${GameMode.INVITE}-${url}`); //was gamemode as object, needed as string
			setIsConnectionOpen(true);
		});

		ws.current.on('disconnect', () => {
			console.log(`Disconnected from pong`);
			setActiveGame(false);
			setIsConnectionOpen(false);
		});

		ws.current.on('start_game', () => {
			setActiveGame(true);
		});

		ws.current.on('victory', () => {
			console.log("VICTORY!")
			setVictory('victory');
		});

		ws.current.on('defeat', () => {
			console.log("DEFEAT!")
			setVictory('defeat');
		});
		
		ws.current.on('end_game', () => {
			console.log("GAME ENDED");
			setActiveGame(false);
			setGameOver(true);
		});

		ws.current.on('room_full', () => {
			setActiveGame(false);
			setVictory('occupied');
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
						case 'occupied':
							return (
								<div  className="menu">
									<p className="defeat">How did you find a way into a full gameroom? Go home!</p>
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

export default GameInvite;