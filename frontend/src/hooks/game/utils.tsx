// export {};

// import "./pong.css";


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