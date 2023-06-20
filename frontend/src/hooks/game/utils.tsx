export {};

import "./pong.css";

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
	return 0;
	//return (getFrameHeight() - getPaddleHeight()) / 2;
};

const getRandomDirection = () => {
	const randomX = Math.random() < 0.5 ? -1 : 1;
	const randomY = Math.random() < 0.5 ? -1 : 1;
	return { x: randomX, y: randomY };
	// return { x: 0, y: 0 };
};


	// const updateBallPosition = () => {
	// 	const { x, y } = state.ballPosition;
	// 	const { x: dx, y: dy } = state.ballDirection;
	// 	const frameWidth = getFrameWidth();
	// 	const frameHeight = getFrameHeight();
	// 	const ballSize = 20; // Adjust the ball size if needed

	// 	const newBallPosition = { x: x + dx * state.ballSpeed, y: y + dy * state.ballSpeed };

	// 	// Check for collision with top or bottom walls
	// 	if (newBallPosition.y <= 0 || newBallPosition.y >= frameHeight - ballSize) {
	// 		// Reverse the vertical direction
	// 		const newBallDirection = { x: dx, y: -dy };
	// 		dispatch({ type: 'UpdateBallPosition', payload: newBallPosition, direction: newBallDirection });
	// 		return;
	// 	}

	// 	// Check for collision with paddles
	// 	// ...

	// 	// Check for scoring condition
	// 	if (newBallPosition.x <= 0 || newBallPosition.x >= frameWidth - ballSize) {
	// 		// Handle scoring logic here
	// 		// ...
	// 	}

	// 	// Update the ball position in the state
	// 	dispatch({ type: 'UpdateBallPosition', payload: newBallPosition });
	// };

		// const initialBallPosition = React.useMemo(() => {
	// 	const frameWidth = getFrameWidth();
	// 	const frameHeight = getFrameHeight();
	// 	const ballSize = 2; // Adjust the ball size if needed
	// 	const initialX = Math.floor((frameWidth - ballSize) / 2);
	// 	const initialY = Math.floor((frameHeight - ballSize) / 2);
	// 	return { x: initialX, y: initialY };
	// }, []);