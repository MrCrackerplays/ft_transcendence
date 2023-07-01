import { useReducer, useEffect, useRef } from 'react';

import "./pong.css";
import { GameState, PaddleAction, GameActionKind, pongConstants } from '../../../../shared/pongTypes';
import { makeReducer } from '../../../../shared/pongReducer';
import { Socket, io } from "socket.io-client";
import { Constants } from "../../../../shared/constants";

type SocketMagicInput = {
	wbSocket: React.MutableRefObject<Socket | null>; 
	overrideState: (newState: GameState) => void
};
type SocketMagicOutput = {
	playerMovement: (movement: PaddleAction) => void
};

const SocketMagic: (input: SocketMagicInput) => SocketMagicOutput = (input) => {
	
	let reconnectTimer: NodeJS.Timeout | null = null;
	let reconnectDelay = 5000; // milliseconds
	let maxReconnectAttempts = 5;
	let reconnectAttempts = 0;

	const connectWebSocket = () => {
		if (!input.wbSocket.current) {
			console.log(`${Constants.BACKEND_URL}/matchMakingGateway`);
			input.wbSocket.current = io(`${Constants.BACKEND_URL}/matchMakingGateway`, {withCredentials: true}); //io('ws://localhost:3000/game'); //io(`${Constants.BACKEND_URL}/matchMakingGateway`, {withCredentials: true}); // io('ws://localhost:5173/solo', {withCredentials: true});
			input.wbSocket.current.on('connect', () => {
				console.log('WebSocket connection established');
				reconnectAttempts = 0;
			});

			input.wbSocket.current.on('message', (data) => {
				const newState = JSON.parse(data) as GameState;
				input.overrideState(newState);

				if (newState.gameOver) {
					if (input.wbSocket.current) {
						input.wbSocket.current.disconnect();
					}
				}
			});

			input.wbSocket.current.on('disconnect', (reason) => {
				console.log('WebSocket connection closed:', reason);
				if (reconnectAttempts < maxReconnectAttempts) {
					reconnectAttempts++;
					reconnectTimer = setTimeout(() => {
						connectWebSocket();
					}, reconnectDelay);
					console.log(
						`Reconnecting in ${reconnectDelay / 1000} seconds (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`
					);
					reconnectDelay *= 2;
				} else {
					console.log('Max reconnect attempts reached. Connection could not be established.');
					sendGameOverSignal();
					cleanup();
				}
			});

			input.wbSocket.current.on('error', (error) => {
				console.error('WebSocket connection error:', error);
				sendGameOverSignal();
				cleanup();
			});
		}
	};

	const sendGameOverSignal = () => {
		if (input.wbSocket.current) {
			const toSend = {
				event: 'gameOver',
				payload: {
					// data about the game over event?
				},
			};
			input.wbSocket.current.emit('message', JSON.stringify(toSend));
		}
	};

	const playerMovement: (movement: PaddleAction) => void = (movement) => {
		if (input.wbSocket.current) {
			const toSend = {
				event: 'playerMovement',
				payload: {
					movement: movement,
				},
			};
			input.wbSocket.current.emit('message', JSON.stringify(toSend));
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
	connectWebSocket();

	return {
		playerMovement: playerMovement,
	};
};


const PongGame = () => {
	const playerID = "player1";
	const opponentID = "player2";

	const initialState: GameState = {
		leftPaddle: { playerID: playerID, paddlePosition: 0, action: PaddleAction.None, score: 0, moved: false },
		rightPaddle: { playerID: opponentID, paddlePosition: 0, action: PaddleAction.None, score: 0, moved: false },
		ball: { velocity: { x: 0.5, y: 0.0 }, position: { x: 0, y: 0 } }, //if have time, add random velocity start
		time: 0,
		gameOver: false,
		winner: "",
		singlemode: true,
	};
	const [state, dispatch] = useReducer(makeReducer(playerID), initialState);
	const wbSocket = useRef<Socket | null>(null);

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

		//KEYBOARD INPUT 
		const handleKeyDown = (event) => {
			if (event.key === "ArrowUp") {
				dispatch({ kind: GameActionKind.arrowUp, value: null });
				output.playerMovement(PaddleAction.Up);
			} else if (event.key === "ArrowDown") {
				dispatch({ kind: GameActionKind.arrowDown, value: null });
				output.playerMovement(PaddleAction.Down);
			}
		};
		const handleKeyUp = (event) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				dispatch({ kind: GameActionKind.StopMovement, value: null });
				output.playerMovement(PaddleAction.None);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		return () => {
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
	//RENDER 
	return (
		<div className="pong-frame">
			<div className="centre-line"></div>
			<div className="h-centre-line"></div>{/* REMOVE later */}
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
			}}>{state.leftPaddle.paddlePosition}</div>
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

//old
// const SocketMagic: (input: SocketMagicInput) => SocketMagicOutput = (input) => {


// 	//write action to server -> player action sent to server
// 	const socket = new WebSocket("ws://localhost:8080/ws");
// 	const playerMovement: (movement: PaddleAction) => void = (movement) => {

// 		const toSend = {
// 			event: "playerMovement",
// 			payload: {
// 				movement: movement
// 			}
// 		};
// 		socket.send(JSON.stringify(toSend));
// 	};

// 	//open connection when game start
// 	socket.onopen = () => {

// 	};

// 	//read state from server -> I get true state from server -> override state client
// 	socket.onmessage = (event) => {
// 		const data = event.data;
// 		console.log(data);
// 		const newState = JSON.parse(data) as GameState;
// 		input.overrideState(newState);
// 		// this.setState({state: newState});
// 	};



// 	// Fired when a connection with a WebSocket is closed
// 	socket.onclose = function (event) {

// 	};

// 	// Fired when a connection with a WebSocket has been closed because of an error
// 	socket.onerror = function (event) {

// 	};

// 	return {
// 		playerMovement: playerMovement
// 	};
// }

//default socket approach:
// SocketMagic - handling game communication
// @param input - Object containing a function to override the client state
// @returns Object with a function to send player movements

// connectWebSocket - Establishes a WebSocket connection with the server and handles WebSocket events
// + manages reconnection attempts and sends a game over signal when the maximum number of reconnect attempts is reached.
// sendGameOverSignal - Sends a game over signal to the server indicating that the game has ended.
// playerMovement - Sends the player movement (paddle action )to the server.
// cleanup - Cleans up the WebSocket and timer
// const SocketMagic: (input: SocketMagicInput) => SocketMagicOutput = (input) => {
// 	const wbSocket = useRef<WebSocket | null>(null);
// 	let reconnectTimer: NodeJS.Timeout | null = null;
// 	let reconnectDelay = 5000; // milliseconds
// 	let maxReconnectAttempts = 5;
// 	let reconnectAttempts = 0;

// 	const connectWebSocket = () => {
// 		if (!wbSocket.current) {
// 			wbSocket.current = new WebSocket('ws://localhost:3000/game');
// 			wbSocket.current.onopen = () => {
// 				console.log('WebSocket connection established');
// 				reconnectAttempts = 0;
// 			};

// 			// Read state from server -> Get the true state from the server -> Override client state
// 			wbSocket.current.onmessage = (event) => {
// 				const data = event.data;
// 				console.log(data);
// 				const newState = JSON.parse(data) as GameState;
// 				input.overrideState(newState);
// 				//if score 10 found -> game over
// 				if (newState.gameOver) {
// 					if (wbSocket.current)
// 						wbSocket.current.close();
// 				}
// 				// this.setState({state: newState});
// 			};
// 			wbSocket.current.onclose = (event) => {
// 				console.log('WebSocket connection closed:', event.code, event.reason);
// 				if (reconnectAttempts < maxReconnectAttempts) {
// 					reconnectAttempts++;
// 					reconnectTimer = setTimeout(() => { //reconnect after a delay
// 						connectWebSocket();
// 					}, reconnectDelay);
// 					console.log(
// 						`Reconnecting in ${reconnectDelay / 1000} seconds (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`
// 					);
// 					reconnectDelay *= 2; // Increase reconnect delay
// 				} else {
// 					console.log('Max reconnect attempts reached. Connection could not be established.');
// 					sendGameOverSignal();
// 					cleanup();
// 				}
// 			};
// 			wbSocket.current.onerror = (event) => {
// 				console.error('WebSocket connection error:', event);
// 				sendGameOverSignal();
// 				cleanup();
// 			};
// 		}
// 	};

// 	const sendGameOverSignal = () => {
// 		if (wbSocket.current) {
// 			const toSend = {
// 				event: 'gameOver',
// 				payload: {
// 					// data about the game over event?
// 				},
// 			};
// 			wbSocket.current.send(JSON.stringify(toSend));
// 		}
// 	};

// 	const playerMovement: (movement: PaddleAction) => void = (movement) => {
// 		if (wbSocket.current) {
// 			const toSend = {
// 				event: 'playerMovement',
// 				payload: {
// 					movement: movement,
// 				},
// 			};
// 			wbSocket.current.send(JSON.stringify(toSend));
// 		}
// 	};

// 	const cleanup = () => {
// 		if (wbSocket.current) {
// 		  wbSocket.current.close();
// 		}
// 		if (reconnectTimer) {
// 		  clearTimeout(reconnectTimer);
// 		}
// 	  };

// 	// Start WebSocket connection
// 	connectWebSocket();

// 	return {
// 		playerMovement: playerMovement,
// 	};
// };