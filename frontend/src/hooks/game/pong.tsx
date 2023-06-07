
import React from "react";
import { useReducer, useEffect } from 'react';
import "./pong.css";
// import {  getFrameHeight } from './utils'


const getFrameHeight = () => {
	const frameH = getComputedStyle(document.documentElement).getPropertyValue('--pong-frame-height-pixels');
	return parseInt(frameH, 10);
};

const getFrameWidth = () => {
	const frameW = getComputedStyle(document.documentElement).getPropertyValue('--pong-frame-width-pixels');
	return parseInt(frameW, 10);
};

const getPaddleHeight = () => {
	const paddleH = getComputedStyle(document.documentElement).getPropertyValue('--paddle-height-pixels');
	return parseInt(paddleH, 10);
};

const getPixelSizes = () => {
	const frameWidthPercent = getComputedStyle(document.documentElement).getPropertyValue('--pong-frame-width');
	const frameWidthPixel = parseFloat(frameWidthPercent) / 100 * window.innerWidth;
	document.documentElement.style.setProperty('--pong-frame-width-pixels', `${frameWidthPixel}px`);

	const frameHeightPercent = getComputedStyle(document.documentElement).getPropertyValue('--pong-frame-height');
	const frameHeightPixel = parseFloat(frameHeightPercent) / 100 * window.innerHeight;
	document.documentElement.style.setProperty('--pong-frame-height-pixels', `${frameHeightPixel}px`);

	const paddHeighthPercent = getComputedStyle(document.documentElement).getPropertyValue('--paddle-height');
	const paddHeightPixel = parseFloat(paddHeighthPercent) / 100 * window.innerHeight;
	document.documentElement.style.setProperty('--paddle-height-pixels', `${paddHeightPixel}px`);
};

const getPaddlePositionStart = () => {
	return (getFrameHeight() - getPaddleHeight()) / 2;
};

const initialBallPosition = React.useMemo(() => {
	const frameWidth = getFrameWidth();
	const frameHeight = getFrameHeight();
	const ballSize = 20; // Adjust the ball size if needed
	const initialX = Math.floor((frameWidth - ballSize) / 2);
	const initialY = Math.floor((frameHeight - ballSize) / 2);
	return { x: initialX, y: initialY };
}, []);

const getRandomDirection = () => {
	const randomX = Math.random() < 0.5 ? -1 : 1;
	const randomY = Math.random() < 0.5 ? -1 : 1;
	return { x: randomX, y: randomY };
};

const moveBall = (state) => {
	const { ballPosition, ballDirection, ballSpeed } = state;

	// Calculate the new position of the ball based on the direction and speed
	const newBallPosition = {
		x: ballPosition.x + ballDirection.x * ballSpeed,
		y: ballPosition.y + ballDirection.y * ballSpeed
	};

	// Return the updated state with the new ball position
	return {
		...state,
		ballPosition: newBallPosition
	};
};

const PongGame = () => {
	//HELPER FUNCTIONS
	getPixelSizes();

	//STATE CHANGE SWITCH 
	const reducer = (state, action) => {
		let newState = structuredClone(state);
		switch (action.type) {
			case "ArrowUp":
				newState.paddlePosition = Math.max(state.paddlePosition - state.paddleSpeed, 0);
				break;
			case "ArrowDown":
				const possibleMin = getFrameHeight() - getPaddleHeight();
				newState.paddlePosition = Math.min(state.paddlePosition + state.paddleSpeed, possibleMin);
				break;
			case "StopMovement":
				newState.paddlePosition = state.paddlePosition;
				break;
			case "MoveBall":
				newState = moveBall(state);
				//update
				//	ballPosition: initialBallPosition, //array x,y
				//	ballDirection: getRandomDirection(), //array x,y
				//	ballSpeed: 10,




				break;
		}
		return newState
	};

	const [state, dispatch] = useReducer(reducer, {

		//paddle
		paddlePosition: getPaddlePositionStart(),
		paddleSpeed: 10,

		//ball
		ballPosition: initialBallPosition, //array x,y
		ballDirection: getRandomDirection(), //array x,y
		ballSpeed: 10,

		//score
		playerScore: 0,
		opponentScore: 0,
	});

	//KEYBOARD INPUT 
	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "ArrowUp") {
				dispatch({ type: 'ArrowUp' });
			} else if (event.key === "ArrowDown") {
				dispatch({ type: 'ArrowDown' });
			}
		};
		const handleKeyUp = (event) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				dispatch({ type: "StopMovement" });
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
			dispatch({ type: 'MoveBall' });
		}, 50); //every 50ms ball moves
		return () => clearInterval(interval);
	}, []);



	//RENDER 
	return (
		<div className="pong-frame">
			<div className="centre-line"></div>
			<div className="paddle-left" style={{ top: state.paddlePosition }}></div>
			<div className="paddle-right"></div>
			<div className="pong-ball" style={{ left: state.ballPosition.x, top: state.ballPosition.y }}></div>
			{/* <div className="pong-ball" style={{ left: `calc(${state.ballPosition.x}px - 10px)`, top: `calc(${state.ballPosition.y}px - 10px)` }}></div> */}

		</div>
	);
};

export default PongGame;


	//GAME STATE
	// 	const board = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos);
	// 		/* Paddle Array */
	// 		player:   board.map(x => (x  * COL_SIZE) + PADDLE_EDGE_SPACE),
	// 		opponent: board.map(x => ((x+1) * COL_SIZE)-(PADLE_EDGE_SPACE+1)),
	// 		/* ball */
	// 		ball:     Math.round((ROW_SIZE * COL_SIZE)/2)+ ROW_SIZE,
	// 		deltaY:   -COL_SIZE, // change ball in Y AXIS
	// 		deltaX:   -1, // change ball in  X AXIS