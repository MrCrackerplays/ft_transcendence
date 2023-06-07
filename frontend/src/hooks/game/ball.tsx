



export const updateBallPosition = (state) => {
	const { x, y } = state.ballPosition;
	const { x: dx, y: dy } = state.ballDirection;
  
	// Calculate the new position by adding the direction deltas
	const newBallPosition = { x: x + dx, y: y + dy };
  
	// Return the updated position
	return newBallPosition;
  };
  