
import React from "react";
import { useReducer, useEffect } from 'react';
import "./pong.css";

//this - on BE only?
type Players = {
	PlayerScore : number,
	OpponentScore : number,
	PlayerID : string,
	OpponentID : string,
	PlayerWin : boolean,
	OpponentWin : boolean,
};

enum PaddleAction {
	Up,
	Down,
	None,
}

enum GameAction {
	arrowUp,
	arrowDown,
	StopMovement,
	updateTime,
};

type PaddleState = { //move to Players?
	playerID: string,
	paddlePosition: number,
	action: PaddleAction,
	score: number, //move to Players?
};

type BallState = {
	velocity: { x: number, y: number },
	position: { x: number, y: number },
};

type GameState = {
	leftPaddle: PaddleState,
	rightPaddle: PaddleState,
	ball: BallState,
	time: number,
};

const paddleHeight = 0.15;
const paddleWidth = 0.02;
const paddleSpeed = 1;
const ballHeight = 0.02;
const ballWidth = 0.02;

function checkPaddleBoarder(paddlePosition) {
	const paddleMaxUp = 1 - paddleHeight / 2;
	const paddleMaxDown = -1 + paddleHeight / 2;
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
	const maxBallPosition = 1 - ballHeight / 2;
	const minBallPosition = -1 + ballHeight / 2;
	updateBallPosition(state, timeDlta);

	//up and down wall collision
	if (ball.position.y >= maxBallPosition || ball.position.y <= minBallPosition) {
		state.ball.velocity = { x : ball.velocity.x, y : (ball.velocity.y * -1) };
		return;
	} 


	const padStartX = paddleWidth * 2;
	const padEndX = paddleWidth * 2;
	
	//padle collision
	//paddle position is middle of paddle
	const leftMaxPaddleY = (leftPaddle.paddlePosition + paddleHeight / 2);
	const leftMinPaddleY = (leftPaddle.paddlePosition - paddleHeight / 2);
	
	const rightMaxPaddleY = (rightPaddle.paddlePosition + paddleHeight / 2);
	const rightMinPaddleY = (rightPaddle.paddlePosition - paddleHeight / 2);
	
	const isBallAtLeftWall = (ball.position.x - ballWidth / 2) <= -1;
	const isBallAtRightWall = (ball.position.x + ballWidth / 2) >= 1;
	const willBounceLeftPaddle = leftMinPaddleY <= ball.position.y && ball.position.y <= leftMaxPaddleY;
	const willBounceRightPaddle = rightMinPaddleY <= ball.position.y && ball.position.y <= rightMaxPaddleY;
	if (isBallAtLeftWall) {
		if (willBounceLeftPaddle) {
			state.ball.velocity = { x : -ball.velocity.x, y : ball.velocity.y };
			updateBallPosition(state, timeDlta);
		} else {
			state.ball.position = { x : 0, y : 0 };
			state.leftPaddle.score += 1;
		}
	} else if (isBallAtRightWall) {
		if (willBounceRightPaddle) {
			state.ball.velocity = { x : -ball.velocity.x, y : ball.velocity.y };
			updateBallPosition(state, timeDlta);
		} else {
			state.ball.position = { x : 0, y : 0 };
			state.rightPaddle.score += 1;
		}

	}
};




const makeReducer = (playerID: string) => {
	const reducer = (state: GameState, action: GameAction) => {
		let newState = structuredClone(state);
		switch (action) {
			case GameAction.arrowUp:
				if (newState.leftPaddle.playerID == playerID) {
					newState.leftPaddle.action = PaddleAction.Up;
				} else {
					newState.rightPaddle.action = PaddleAction.Up;
				}
				break;
			case GameAction.arrowDown:
				if (newState.leftPaddle.playerID == playerID) {
					newState.leftPaddle.action = PaddleAction.Down;
				} else {
					newState.rightPaddle.action = PaddleAction.Down;
				}
				break;
			case GameAction.StopMovement:
				if (newState.leftPaddle.playerID == playerID) {
					newState.leftPaddle.action = PaddleAction.None;
				} else {
					newState.rightPaddle.action = PaddleAction.None;
				}
				break;
			case GameAction.updateTime:
				const timeDlta = 0.1;
				newState.time += timeDlta;
				switch (newState.leftPaddle.action) {
					case PaddleAction.Up:
						newState.leftPaddle.paddlePosition += timeDlta * paddleSpeed;
						break;
					case PaddleAction.Down:
						newState.leftPaddle.paddlePosition -= timeDlta * paddleSpeed;
						break;
					case PaddleAction.None:
						break;
				}
				switch (newState.rightPaddle.action) {
					case PaddleAction.Up:
						newState.rightPaddle.paddlePosition += timeDlta * paddleSpeed;
						break;
					case PaddleAction.Down:
						newState.rightPaddle.paddlePosition -= timeDlta * paddleSpeed;
						break;
					case PaddleAction.None:
						break;
				}
				newState.leftPaddle.paddlePosition = checkPaddleBoarder(newState.leftPaddle.paddlePosition);
				newState.rightPaddle.paddlePosition = checkPaddleBoarder(newState.rightPaddle.paddlePosition);
				//ball movement
				//ball collision : up and down wall collision
				updateBall(newState, timeDlta); //player paddle
				break;
		}
		return newState
	};
	return reducer;
};

const PongGame = () => {
	const playerID = "player1";
	const opponentID = "player2";

	const initialState: GameState = {
		leftPaddle: { playerID: playerID, paddlePosition: 0, action: PaddleAction.None, score: 0},
		rightPaddle: { playerID: opponentID, paddlePosition: 0, action: PaddleAction.None, score: 0},
		ball: { velocity: { x: -0.1, y: -0.001 }, position: { x: 0, y: 0 } },
		time: 0,
	};
	const [state, dispatch] = useReducer(makeReducer(playerID), initialState);

	//KEYBOARD INPUT 
	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "ArrowUp") {
				dispatch(GameAction.arrowUp);
			} else if (event.key === "ArrowDown") {
				dispatch(GameAction.arrowDown);
			}
		};
		const handleKeyUp = (event) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				dispatch(GameAction.StopMovement);
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
			dispatch(GameAction.updateTime);
		}, 50); //every 50ms ball moves
		return () => clearInterval(interval);
	}, []);


	const k = -42.5 / 0.925;
	const l = 42.5;

	const lBallCorrection = 0.5 - ballWidth / 2;
	const kBallCorrection = lBallCorrection / (1 - ballWidth / 2);

	const leftPaddleTop = k * state.leftPaddle.paddlePosition + l;
	const rightPaddleTop = k * state.rightPaddle.paddlePosition + l;

	const ballPositionLeft = kBallCorrection * state.ball.position.x + lBallCorrection;
	const ballPositionTop = kBallCorrection * state.ball.position.y + lBallCorrection;
	//RENDER 
	return (
		<div className="pong-frame">
			<div className="centre-line"></div>
			<div className="h-centre-line"></div>
			<div className="paddle-right" style={{
				top: rightPaddleTop + '%',
				height: (paddleHeight * 100) + '%',
			}}></div>
			<div className="paddle-left" style={{
				top: leftPaddleTop + '%',
				height: (paddleHeight * 100) + '%',
			}}></div>
			<div className="pong-ball" style={{
				left: (ballPositionLeft * 100) + '%',
				top: (ballPositionTop * 100) + '%',
				width: (ballWidth * 100) + '%',
				height: (ballHeight * 100) + '%',
				}}>{state.ball.position.x}, {state.ball.position.y}</div>
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