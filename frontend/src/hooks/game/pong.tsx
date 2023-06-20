
import React from "react";
import { useReducer, useEffect } from 'react';
import "./pong.css";
import { makeReducer, GameState, PaddleAction, GameActionKind, pongConstants } from "./pongReducer";

type SocketMagicInput = {
	overrideState: (newState: GameState) => void
};

type SocketMagicOutput = {
	playerMovement: (movement: PaddleAction) => void
};
//https://en.wikipedia.org/wiki/WebSocket
const SocketMagic: (input: SocketMagicInput) => SocketMagicOutput = (input) => {

	const socket = new WebSocket("ws://localhost:8080/ws");
	const playerMovement: (movement: PaddleAction) => void = (movement) => {
		socket.send(JSON.stringify({ movement: movement }));
	};
	
	//open connection when game start
	socket.onopen = () => {

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

	// Fired when a connection with a WebSocket is closed
	socket.onclose = function (event) {

	};

	// Fired when a connection with a WebSocket has been closed because of an error
	socket.onerror = function (event) {

	};

	return {
		playerMovement: playerMovement
	};
}

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
	};
	const [state, dispatch] = useReducer(makeReducer(playerID), initialState);

	useEffect(() => {
		// socket magic
		const overrideState = (newState: GameState) => {
			dispatch({ kind: GameActionKind.overrideState, value: newState });
		};
		const input: SocketMagicInput = {
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