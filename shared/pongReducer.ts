
import {
	pongConstants,
	GameState,
	GameAction,
	GameActionKind,
	PaddleAction,
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

	const padX = pongConstants.paddleWidth + pongConstants.framePaddleGap * 2;//why * 2? dunno

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
		if (willBounceLeftPaddle) {
			state.ball.velocity = { x: -ball.velocity.x, y: ball.velocity.y };
			if (state.leftPaddle.moved == false) {
				state.ball.velocity.x *= 1.5;
				state.leftPaddle.moved = true;
			}
			if (state.leftPaddle.paddlePosition > 0 || state.leftPaddle.paddlePosition < 0) {
				if (state.ball.velocity.y == 0 && state.leftPaddle.paddlePosition > 0) {
					state.ball.velocity.y += 0.05;
					state.ball.velocity.x -= 0.005;
				}

				else if (state.ball.velocity.y == 0 && state.leftPaddle.paddlePosition < 0)
					state.ball.velocity.y -= 0.05;
				else if (state.ball.velocity.y > 0)
					state.ball.velocity.y += 0.2;
				else
					state.ball.velocity.y -= 0.2;
			}
			updateBallPosition(state, timeDlta);
		} else {
			state.ball.position = { x: 0, y: 0 };
			state.rightPaddle.score += 1;
			state.leftPaddle.moved = false;
			state.rightPaddle.moved = false;
			state.ball.velocity = { x: 0.5, y: 0.0 };
		}
	} else if (isBallAtRightWall) {
		if (state.singlemode) {
			state.ball.velocity = { x: -ball.velocity.x, y: ball.velocity.y };
			updateBallPosition(state, timeDlta);
		}
		else if (willBounceRightPaddle) {
				state.ball.velocity = { x : -ball.velocity.x, y : ball.velocity.y };
				if (state.rightPaddle.moved == false) {
					state.ball.velocity.x *= 1.5;
					state.rightPaddle.moved = true;
				}
				updateBallPosition(state, timeDlta);
			} else {
				state.ball.position = { x : 0, y : 0 };
				state.leftPaddle.score += 1;
				state.rightPaddle.moved = false;
				state.leftPaddle.moved = false;
				state.ball.velocity =  {x: -0.3, y: 0.0};
			}
			//all right wall is paddle, pong with shadow KEEP
			// state.ball.velocity = { x: -ball.velocity.x, y: ball.velocity.y };
			// updateBallPosition(state, timeDlta);
		}
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
					break;
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