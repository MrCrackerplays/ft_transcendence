import React, { useEffect, useRef, useState, MutableRefObject } from "react";
import { useNavigate } from 'react-router-dom';
import { Socket, io } from "socket.io-client";
import { Constants } from "../../../../../shared/constants";
import '../../menu/home.css';
import PongGame from "../../../hooks/game/pong";

function ReturnToHome() {
	console.log('game ended return to homepage')
	const navigate = useNavigate();

	useEffect(() => {
		handleRedirect();
	}, []);

	const handleRedirect = () => {
		navigate('/')
	};

	return (
		<p className="text">Game Over</p>
	)
}

function CancelButton() {
	const navigate = useNavigate();

	function handleClick() {
		navigate('/');
	}

	return (
		<button className="button" onClick={() => handleClick()}>Cancel</button>
	)
}

function MatchMakingQueue(gamemode: {gamemode: string}) {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const [activeGame, setActiveGame] = useState(false);
	const [gameOver, setGameOver] = useState(false);
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
			ws.current?.emit("join_queue", gamemode.gamemode); //was gamemode as object, needed as string
			setIsConnectionOpen(true);
		});

		ws.current.on('disconnect', () => {
			console.log(`Disconnected from pong`);
			setActiveGame(false);
			// setGameOver(true);
			setIsConnectionOpen(false);
			//after disconnect does not allow to play further, cleanup still in need
		});

		ws.current.on('joined_queue', () => {
			console.log("joined queue");
		});

		ws.current.on('start_game', () => {
			setActiveGame(true);
		});
		
		ws.current.on('end_game', () => {
			console.log('game has ended');
			setActiveGame(false);
			setGameOver(true);
		});

		return () => {
			ws.current?.close();
			console.log("cleaning queue");
		}
	}, []);

	const renderGame = () => {
		switch (activeGame) {
			case false:
				if (!gameOver) {
					return (
						<div  className="menu">
							<p className="text">Waiting for opponent...</p>
							<CancelButton></CancelButton>
						</div>
					)
					
				}
				return (
					<ReturnToHome></ReturnToHome>
				)
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