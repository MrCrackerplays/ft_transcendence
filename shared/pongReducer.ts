
import {
	pongConstants,
	GameState,
	GameAction,
	GameActionKind,
	PaddleAction,
	ballModifier,
	startGameState,
	PaddleState,
	BallState,
} from './pongTypes';

function checkPaddleBoarder(paddlePosition) {//up and down boader frame for paddle
	const paddleMaxUp = 1 - pongConstants.paddleHeight / 2;
	const paddleMaxDown = -1 + pongConstants.paddleHeight / 2;
	if (paddlePosition >= paddleMaxUp) {
		return paddleMaxUp;
	} else if (paddlePosition <= paddleMaxDown) {
		return paddleMaxDown;
	} else {
		return paddlePosition;
	}
};

function updateBallPosition(state: GameState, timeDlta: number) {
	state.ball.position.x += state.ball.velocity.x * timeDlta;
	state.ball.position.y += state.ball.velocity.y * timeDlta;
}

function restartPositions(state: GameState) {
	state.ball.position = startGameState.ball.position;
	state.leftPaddle.moved = startGameState.leftPaddle.moved;
	state.rightPaddle.moved = startGameState.rightPaddle.moved;
	state.ball.velocity = startGameState.ball.velocity;
}

function modifyBallMovement(ball: BallState, paddlePosition: number) {

	if (ball.velocity.y == 0 && paddlePosition > 0) {
		ball.velocity.y += 0.05;
		ball.velocity.x -= 0.005;
	}
	else if (ball.velocity.y == 0 && paddlePosition < 0)
		ball.velocity.y -= ballModifier.angleChangeAfterHit;
	else if (ball.velocity.y > 0)
		ball.velocity.y += ballModifier.minorAngleChangeAfterHit;
	else
		ball.velocity.y -= ballModifier.minorAngleChangeAfterHit;
}


function updateBall(state: GameState, timeDlta: number) {
	const ball = state.ball;
	const leftPaddle = state.leftPaddle;
	const rightPaddle = state.rightPaddle;
	const maxBallPosition = 1 - pongConstants.ballHeight / 2;
	const minBallPosition = -1 + pongConstants.ballHeight / 2;
	updateBallPosition(state, timeDlta);

	//up and down wall collision
	if (ball.position.y >= maxBallPosition || ball.position.y <= minBallPosition) {
		state.ball.velocity = { x: ball.velocity.x, y: (ball.velocity.y * -1) };
		return;
	}

	const padX = pongConstants.paddleWidth + pongConstants.framePaddleGap * 2;//why * 2? dunno, math magic

	const minBallY = ball.position.y - (pongConstants.ballHeight / 2);
	const maxBallY = ball.position.y + (pongConstants.ballHeight / 2);

	//padle collision : left
	const leftMaxPaddleY = (leftPaddle.paddlePosition + pongConstants.paddleHeight / 2);
	const leftMinPaddleY = (leftPaddle.paddlePosition - pongConstants.paddleHeight / 2);
	const isBallAtLeftWall = (ball.position.x - pongConstants.ballWidth / 1) - padX <= -1;
	const willBounceLeftPaddle = (leftMinPaddleY <= minBallY && minBallY <= leftMaxPaddleY) || (leftMinPaddleY <= maxBallY && maxBallY <= leftMaxPaddleY);

	//padle collision : right
	const rightMaxPaddleY = (rightPaddle.paddlePosition + pongConstants.paddleHeight / 2);
	const rightMinPaddleY = (rightPaddle.paddlePosition - pongConstants.paddleHeight / 2);
	const isBallAtRightWall = (ball.position.x + pongConstants.ballWidth / 1) + padX >= 1;
	const willBounceRightPaddle = (rightMinPaddleY <= minBallY && minBallY <= rightMaxPaddleY) || (rightMinPaddleY <= maxBallY && maxBallY <= rightMaxPaddleY);;

	if (isBallAtLeftWall) {
		//SINGLE MODE AND CLASSIC MODE
		if (willBounceLeftPaddle) {
			//if ball hits the paddle, change direction and apply angle change
			state.ball.velocity = { x: -ball.velocity.x, y: ball.velocity.y };
			if (state.leftPaddle.moved == false && state.rightPaddle.moved == false) {
				//if first hit of the paddle, accelerate ball
				state.ball.velocity.x *= ballModifier.accelareteAfterFirstMove;
				state.leftPaddle.moved = true;
			}
			if (state.leftPaddle.paddlePosition > 0 || state.leftPaddle.paddlePosition < 0) {
				//if Left paddle is moving add move changes for ball
				modifyBallMovement(state.ball, state.leftPaddle.paddlePosition);
			}
			updateBallPosition(state, timeDlta);
		} else {
			//missed ball for left paddle -> right paddle scores up
			state.rightPaddle.score += 1;
			restartPositions(state);
		}
	} else if (isBallAtRightWall) {
		//SINGLE MODE
		if (state.singlemode) {
			state.ball.velocity = { x: -ball.velocity.x, y: ball.velocity.y };
			updateBallPosition(state, timeDlta);
		}
		//CLASSIC MODE
		else if (willBounceRightPaddle) {
			//if ball hits the paddle, change direction and apply angle change
			state.ball.velocity = { x : -ball.velocity.x, y : ball.velocity.y };
			if (state.leftPaddle.moved == false && state.rightPaddle.moved == false) {
				//if first hit of the paddle, accelerate ball
				state.ball.velocity.x *= ballModifier.accelareteAfterFirstMove;
				state.rightPaddle.moved = true;
			}
			if (state.rightPaddle.paddlePosition > 0 || state.rightPaddle.paddlePosition < 0) {
				//if Right paddle is moving add move changes for ball
				modifyBallMovement(state.ball, state.rightPaddle.paddlePosition);
			}
			updateBallPosition(state, timeDlta);
			} else {
				//missed ball for right paddle -> left paddle scores up
				state.leftPaddle.score += 1;
				restartPositions(state);
			}
		}

		//GAME OVER
		if (state.leftPaddle.score == 10) {
			state.gameOver = true;
			state.winner = state.leftPaddle.playerID;
		} else if (state.rightPaddle.score == 10) {
			state.gameOver = true;
			state.winner = state.rightPaddle.playerID;
		}
	};

	export const makeReducer = (playerID: string) => {

		const reducer = (state: GameState, action: GameAction) => {
			let newState = structuredClone(state);
			if (newState.gameOver) {
				return newState;
			}
			switch (action.kind) {
				case GameActionKind.overrideState:
					newState = action.value;
					//console.log(`reducer time: ${JSON.stringify(newState.time)}`);
					return newState;
				case GameActionKind.arrowUp:
					if (newState.leftPaddle.playerID == playerID) {
						newState.leftPaddle.action = PaddleAction.Up;
					} else {
						newState.rightPaddle.action = PaddleAction.Up;
					}
					break;
				case GameActionKind.arrowDown:
					if (newState.leftPaddle.playerID == playerID) {
						newState.leftPaddle.action = PaddleAction.Down;
					} else {
						newState.rightPaddle.action = PaddleAction.Down;
					}
					break;
				case GameActionKind.StopMovement:
					if (newState.leftPaddle.playerID == playerID) {
						newState.leftPaddle.action = PaddleAction.None;
					} else {
						newState.rightPaddle.action = PaddleAction.None;
					}
					break;
				case GameActionKind.updateTime:
					newState.time += pongConstants.timeDlta;
					//console.log(`frontend time from reducer: ${JSON.stringify(newState.time)}`);
					switch (newState.leftPaddle.action) {
						case PaddleAction.Up:
							newState.leftPaddle.paddlePosition -= pongConstants.timeDlta * pongConstants.paddleSpeed;
							break;
						case PaddleAction.Down:
							newState.leftPaddle.paddlePosition += pongConstants.timeDlta * pongConstants.paddleSpeed;
							break;
						case PaddleAction.None:
							break;
					}
					switch (newState.rightPaddle.action) {
						case PaddleAction.Up:
							newState.rightPaddle.paddlePosition -= pongConstants.timeDlta * pongConstants.paddleSpeed;
							break;
						case PaddleAction.Down:
							newState.rightPaddle.paddlePosition += pongConstants.timeDlta * pongConstants.paddleSpeed;
							break;
						case PaddleAction.None:
							break;
					}
					newState.leftPaddle.paddlePosition = checkPaddleBoarder(newState.leftPaddle.paddlePosition);
					newState.rightPaddle.paddlePosition = checkPaddleBoarder(newState.rightPaddle.paddlePosition);
					//ball movement
					//ball collision : up and down wall collision
					updateBall(newState, pongConstants.timeDlta); //player paddle
					break;
			}
			return newState
		};
		return reducer;
	};