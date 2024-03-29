import { useReducer, useEffect, useRef, MutableRefObject } from 'react';

import "./pong.css";
import { GameState, PaddleAction, GameActionKind, pongConstants , startGameState } from '../../../../shared/pongTypes';
import { makeReducer } from '../../../../shared/pongReducer';
import { Socket, io } from "socket.io-client";
import { Constants  } from "../../../../shared/constants";

type SocketMagicInput = {
	wbSocket: MutableRefObject<Socket | undefined>
	overrideState: (newState: GameState) => void
};
type SocketMagicOutput = {
	playerMovement: (movement: PaddleAction) => void
};

const SocketMagic: (input: SocketMagicInput) => SocketMagicOutput | undefined = (input) => {
	const wbSocket = input.wbSocket;
	const socket = input.wbSocket.current;

	let reconnectTimer: NodeJS.Timeout | null = null;
	let reconnectDelay = 5000; // milliseconds
	let maxReconnectAttempts = 5;
	let reconnectAttempts = 0;

	if (!socket) {
		return undefined;
	}

	socket.on('pong_state', (newState: GameState) => {
		input.overrideState(newState);
	});



	const sendGameOverSignal = () => {
		if (input.wbSocket.current) {
			const toSend = {
				// event: 'gameOver',
				payload: {
					// data about the game over event?
				},
			};
			input.wbSocket.current.emit('gameOver', JSON.stringify(toSend));
		}
	};

	const playerMovement: (movement: PaddleAction) => void = (movement) => {
		if (input.wbSocket.current) {
			input.wbSocket.current.emit('playerMovement', {movement});
		}
	};

	const cleanup = () => {
		if (input.wbSocket.current) {
			input.wbSocket.current.disconnect();
		}
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
		}
	};

	// Start WebSocket connection
	// connectWebSocket();

	return {
		playerMovement: playerMovement,
	};
};

const PongGame = (props: { webSocketRef: MutableRefObject<Socket | undefined>;  gamemode: { gamemode: string } }) => {
	const playerID = "player1";
	const opponentID = "player2";

	const mode: boolean = props.gamemode.gamemode === 'solo' ? true : false;
	const initialState: GameState = {
		leftPaddle: { 
			playerID: playerID, 
			paddlePosition: startGameState.leftPaddle.paddlePosition, 
			action: startGameState.leftPaddle.action, 
			score: startGameState.leftPaddle.score, 
			moved: startGameState.leftPaddle.moved },
		rightPaddle: { 
			playerID: opponentID, 
			paddlePosition: startGameState.rightPaddle.paddlePosition, 
			action: startGameState.rightPaddle.action, 
			score: startGameState.rightPaddle.score, 
			moved: startGameState.rightPaddle.moved },
		ball: { 
			velocity: startGameState.ball.velocity, 
			position: startGameState.ball.position },
		time: startGameState.time,
		gameOver: startGameState.gameOver,
		gameClosing: startGameState.gameClosing,
		winner: startGameState.winner,
		singlemode: mode,
	};

	const [state, dispatch] = useReducer(makeReducer(playerID), initialState);
	//const wbSocket = useRef<Socket | null>(null);
	const wbSocket = props.webSocketRef;

	useEffect(() => {
		// socket magic
		const overrideState = (newState: GameState) => {
			dispatch({ kind: GameActionKind.overrideState, value: newState });
		};
		const input: SocketMagicInput = {
			wbSocket: wbSocket,
			overrideState: overrideState,
		};
		const output = SocketMagic(input);

		// wbSocket.current?.emit('game_started');

		//KEYBOARD INPUT 
		const handleKeyDown = (event) => {
			if (event.key === "ArrowUp") {
				dispatch({ kind: GameActionKind.arrowUp, value: null });
				if (output){
					output.playerMovement(PaddleAction.Up);
				}
			} else if (event.key === "ArrowDown") {
				dispatch({ kind: GameActionKind.arrowDown, value: null });
				if (output){
					output.playerMovement(PaddleAction.Down);
				}
			}
		};
		const handleKeyUp = (event) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				dispatch({ kind: GameActionKind.StopMovement, value: null });
				if (output){
					output.playerMovement(PaddleAction.None);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		return () => {
			if (wbSocket.current) {
				wbSocket.current.disconnect();
			}
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	//BALL MOVEMENT
	useEffect(() => {
		
		const interval = setInterval(() => {
			dispatch({ kind: GameActionKind.updateTime, value: null });
		}, pongConstants.timeDlta * 1000);
		return () => clearInterval(interval);
	}, []);

	const lPaddle = 0.5 - pongConstants.paddleHeight / 4;
	const kPaddle = lPaddle / (1 - pongConstants.paddleHeight / 2);

	const leftPaddleTop = kPaddle * state.leftPaddle.paddlePosition + lPaddle;
	const rightPaddleTop = kPaddle * state.rightPaddle.paddlePosition + lPaddle;

	const lBallCorrection = 0.5 - pongConstants.ballWidth / 4;
	const kBallCorrection = lBallCorrection / (1 - pongConstants.ballWidth / 2);

	const ballPositionLeft = kBallCorrection * state.ball.position.x + lBallCorrection;
	const ballPositionTop = kBallCorrection * state.ball.position.y + lBallCorrection;

	if (props.gamemode.gamemode == 'solo') {
		//RENDER SOLO - no right paddle
		return (
			<div className="pong-frame">
				<div className="centre-line"></div>
				{/* <div className='h-centre-line'></div> */}
				<div className="paddle-left" style={{
					//paddle left
					top: ((leftPaddleTop * 100) + '%'),
					height: (pongConstants.paddleHeight * 50) + '%',
					width: (pongConstants.paddleWidth * 100) + '%',
					left: (pongConstants.framePaddleGap * 100) + '%'
				}}></div>
				<div className="pong-ball" style={{
					left: (ballPositionLeft * 100) + '%',
					top: (ballPositionTop * 100) + '%',
					width: (pongConstants.ballWidth * 50) + '%',
					height: (pongConstants.ballHeight * 50) + '%',
				}}></div>
				<div className="score" style={{
	
					top: 1 + '%',
					left: 25 + '%',
					width: 20 + '%',
					height: 20 + '%',
	
				}}>{state.leftPaddle.score}</div>
				<div className="score" style={{
	
					top: 1 + '%',
					left: 75 + '%',
					width: 20 + '%',
					height: 20 + '%',
	
				}}>{state.rightPaddle.score}</div>
			</div>
		);
	}

	//RENDER 
	return (
		<div className="pong-frame">
			<div className="centre-line"></div>
			{/* <div className='h-center-line'></div> */}
			<div className="paddle-right" style={{
				//paddle right
				top: (rightPaddleTop * 100) + '%',
				height: (pongConstants.paddleHeight * 50) + '%',
				width: (pongConstants.paddleWidth * 100) + '%',
				right: (pongConstants.framePaddleGap * 100) + '%'
			}}></div>
			<div className="paddle-left" style={{
				//paddle left
				top: (leftPaddleTop * 100) + '%',
				height: (pongConstants.paddleHeight * 50) + '%',
				width: (pongConstants.paddleWidth * 100) + '%',
				left: (pongConstants.framePaddleGap * 100) + '%'
			}}></div>
			<div className="pong-ball" style={{
				left: (ballPositionLeft * 100) + '%',
				top: (ballPositionTop * 100) + '%',
				width: (pongConstants.ballWidth * 50) + '%',
				height: (pongConstants.ballHeight * 50) + '%',
			}}></div>
			<div className="score" style={{

				top: 1 + '%',
				left: 25 + '%',
				width: 20 + '%',
				height: 20 + '%',

			}}>{state.leftPaddle.score}</div>
			<div className="score" style={{

				top: 1 + '%',
				left: 75 + '%',
				width: 20 + '%',
				height: 20 + '%',

			}}>{state.rightPaddle.score}</div>
		</div>
	);
};

export default PongGame;
