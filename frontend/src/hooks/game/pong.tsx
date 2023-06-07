
import React from "react";
import { useReducer } from 'react';
import { updateBallPosition } from './ball';

import "./pong.css";

const getFrameHeight = () => {
	const frameH = getComputedStyle(document.documentElement).getPropertyValue('--pong-frame-height-pixels');
	return parseInt(frameH, 10);
	//return frameH;
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
	return ( getFrameHeight() - getPaddleHeight() ) / 2;
};

const PongGame = () => {

	// Call the function initially to set the initial value in pxls
	getPixelSizes();

	//STATE CHANGE SWITCH -----------------------------------------------------------------------------------------------------
	const reducer = (state, action) => {
		let newState = structuredClone(state);
		switch (action.type) {
			case "ArrowUp":
				newState.paddlePosition = Math.max(state.paddlePosition - state.paddleSpeed, 0);
				break;
			case "ArrowDown":
				const frameH = getFrameHeight();
				const paddleH = getPaddleHeight();
				const possibleMin = frameH - paddleH;
				newState.paddlePosition = Math.min(state.paddlePosition + state.paddleSpeed, possibleMin);
				break;
			case "StopMovement":
				newState.paddlePosition = state.paddlePosition;
				break;
			case 'UpdateBallPosition':
				newState.ballPosition = updateBallPosition(newState);
				break;
			}
		return newState
	};

	//GAME STATE -----------------------------------------------------------------------------------------------------
	const [state, dispatch] = useReducer(reducer, {
		paddlePosition: getPaddlePositionStart(),
		paddleSpeed: 90,
		ballPosition: { x: 0, y: 0 },
		ballDirection: { x: 1, y: 1 }, // Initial direction of the ball
	});	  


	//KEYBOARD INPUT -----------------------------------------------------------------------------------------------------
	React.useEffect(() => {
		const handleKeyDown = (event) => {
		  if (event.key === "ArrowUp") {
			// Move paddle up
			dispatch({ type: 'ArrowUp' });
		  } else if (event.key === "ArrowDown") {
			// Move paddle down
			dispatch({ type: 'ArrowDown' });
		  }
		};
		const handleKeyUp = (event) => {
		  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			// Stop paddle movement
			dispatch({ type: "StopMovement"});
		  }
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		// Cleanup event listeners on component unmount
		return () => {
		  window.removeEventListener("keydown", handleKeyDown);
		  window.removeEventListener("keyup", handleKeyUp);
		};
	  }, []);
	  

	//RENDER -----------------------------------------------------------------------------------------------------
	return (
		<div className="pong-frame">
			<div className="centre-line"></div>
			<div className="paddle-left" style={{top: state.paddlePosition}}></div>
			<div className="paddle-right"></div>
			<div className="pong-ball"></div>
		</div>
	);
};

export default PongGame;