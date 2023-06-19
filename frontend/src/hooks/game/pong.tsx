
import React from "react";
import { useReducer, useEffect } from 'react';
import "./pong.css";
import { makeReducer , GameState , PaddleAction, GameActionKind, pongConstants} from "./pongReducer";

type SocketMagicInput = {
	overrideState: (newState: GameState) => void
};

type SocketMagicOutput = {
};

const SocketMagic: (input: SocketMagicInput) => SocketMagicOutput = (input) => {

	const socket = new WebSocket("ws://localhost:8080/ws");
	//open connection when game start
	socket.onopen = () => {
		// if (socket.bufferedAmount == 0)
		// 	input.
		// socket.send("hello new state");
	};

	//read state from server -> I get true state from server -> override state client
	socket.onmessage = (event) => {
		const data = event.data;
		console.log(data);
		const newState = JSON.parse(data) as GameState;
		input.overrideState(newState);
		// this.setState({state: newState});
	};
	//write action to server -> player action sent to server

	return {};
}

const PongGame = () => {
	const playerID = "player1";
	const opponentID = "player2";

	const initialState: GameState = {
		leftPaddle: { playerID: playerID, paddlePosition: 0, action: PaddleAction.None, score: 0, moved: false },
		rightPaddle: { playerID: opponentID, paddlePosition: 0, action: PaddleAction.None, score: 0, moved: false },
		ball: { velocity: { x: 0.5, y: 0.0 }, position: { x: 0, y: 0 }}, //if have time, add random velocity start
		time: 0,
		gameOver: false,
		winner: "",
	};
	const [state, dispatch] = useReducer(makeReducer(playerID), initialState);

	//KEYBOARD INPUT 
	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "ArrowUp") {
				dispatch({kind: GameActionKind.arrowUp, value: null});
			} else if (event.key === "ArrowDown") {
				dispatch({kind : GameActionKind.arrowDown, value : null});
			}
		};
		const handleKeyUp = (event) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				dispatch({kind : GameActionKind.StopMovement, value : null});
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
			dispatch({kind : GameActionKind.updateTime, value : null});
		}, pongConstants.timeDlta * 1000);
		return () => clearInterval(interval);
	}, []);

	//SOCKET MAGIC
	useEffect(() => {
		const overrideState = (newState: GameState) => {
			dispatch({kind : GameActionKind.overrideState, value : newState});
		};
		const input: SocketMagicInput = {
			overrideState: overrideState,
		};
		const output = SocketMagic(input);
	});

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




	// return (
	// 	<div className="pong-frame">
	// 		<div className="centre-line"></div>
	// 		{/* from logic (-1, 1) to % for display */}
	// 		<div className="paddle-right" style={{ top: (state.rightPaddle.paddlePosition * 0.1 + 50) + '%' }}></div>
	// 		<div className="paddle-left" style={{ top: (state.leftPaddle.paddlePosition * 0.1 + 50) + '%' }}></div>
	// 		{/* <div className="paddle-left"></div> */}
	// 		<div className="pong-ball" style={{ left: (state.ball.position.x * 0.1 + 50) + '%', top: (state.ball.position.y * 0.1 + 50) + '%'}}></div>
	// 		{/* <div className="pong-ball" style={{ left: `calc(${state.ballPosition.x}px - 10px)`, top: `calc(${state.ballPosition.y}px - 10px)` }}></div> */}

	// 	</div>
	// );
};

export default PongGame;