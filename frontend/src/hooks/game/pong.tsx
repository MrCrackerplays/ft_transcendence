
import React from "react";
import { useReducer, useEffect } from 'react';
import "./pong.css";

//this - on BE only?
type Players = {
	PlayerScore: number,
	OpponentScore: number,
	PlayerID: string,
	OpponentID: string,
	PlayerWin: boolean,
	OpponentWin: boolean,
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
	gameOver: boolean,
	winner: string,
};

const paddleHeight = 0.3;
const paddleWidth = 0.02;
const framePaddleGap = 0.03;
const paddleSpeed = 0.5;
const ballHeight = 0.04;
const ballWidth = 0.04;
const timeDlta = 0.02;

function checkPaddleBoarder(paddlePosition) {//up and down boader frame for paddle
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
		state.ball.velocity = { x: ball.velocity.x, y: (ball.velocity.y * -1) };
		return;
	}

	const padX = paddleWidth + framePaddleGap * 2;//why * 2? dunno

	const minBallY = ball.position.y - (ballHeight / 2);
	const maxBallY = ball.position.y + (ballHeight / 2);

	//padle collision : left
	const leftMaxPaddleY = (leftPaddle.paddlePosition + paddleHeight / 2);
	const leftMinPaddleY = (leftPaddle.paddlePosition - paddleHeight / 2);
	const isBallAtLeftWall = (ball.position.x - ballWidth / 1) - padX <= -1;
	const willBounceLeftPaddle = (leftMinPaddleY <= minBallY && minBallY <= leftMaxPaddleY) || (leftMinPaddleY <= maxBallY && maxBallY <= leftMaxPaddleY);

	//padle collision : right
	const rightMaxPaddleY = (rightPaddle.paddlePosition + paddleHeight / 2);
	const rightMinPaddleY = (rightPaddle.paddlePosition - paddleHeight / 2);
	const isBallAtRightWall = (ball.position.x + ballWidth / 1) + padX >= 1;
	const willBounceRightPaddle = (rightMinPaddleY <= minBallY && minBallY <= rightMaxPaddleY) || (rightMinPaddleY <= maxBallY && maxBallY <= rightMaxPaddleY);;

	if (isBallAtLeftWall) {
		if (willBounceLeftPaddle) {
			state.ball.velocity = { x: -ball.velocity.x, y: ball.velocity.y };
			updateBallPosition(state, timeDlta);
		} else {
			state.ball.position = { x: 0, y: 0 };
			state.rightPaddle.score += 1;
		}
	} else if (isBallAtRightWall) {
		if (willBounceRightPaddle) {
			state.ball.velocity = { x : -ball.velocity.x, y : ball.velocity.y };
			updateBallPosition(state, timeDlta);
		} else {
			state.ball.position = { x : 0, y : 0 };
			state.leftPaddle.score += 1;
		}
		//debug prps - all wall is paddle
		state.ball.velocity = { x: -ball.velocity.x, y: ball.velocity.y };
		updateBallPosition(state, timeDlta);
	}
	if (state.leftPaddle.score == 10) {
		state.gameOver = true;
		state.winner = state.leftPaddle.playerID;
	} else if (state.rightPaddle.score == 10) {
		state.gameOver = true;
		state.winner = state.rightPaddle.playerID;
	}
};

const makeReducer = (playerID: string) => {
	
	const reducer = (state: GameState, action: GameAction) => {
		let newState = structuredClone(state);
		if (newState.gameOver) {
			return newState;
		}
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
				newState.time += timeDlta;
				switch (newState.leftPaddle.action) {
					case PaddleAction.Up:
						newState.leftPaddle.paddlePosition -= timeDlta * paddleSpeed;
						break;
					case PaddleAction.Down:
						newState.leftPaddle.paddlePosition += timeDlta * paddleSpeed;
						break;
					case PaddleAction.None:
						break;
				}
				switch (newState.rightPaddle.action) {
					case PaddleAction.Up:
						newState.rightPaddle.paddlePosition -= timeDlta * paddleSpeed;
						break;
					case PaddleAction.Down:
						newState.rightPaddle.paddlePosition += timeDlta * paddleSpeed;
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
		leftPaddle: { playerID: playerID, paddlePosition: 0, action: PaddleAction.None, score: 0 },
		rightPaddle: { playerID: opponentID, paddlePosition: 0, action: PaddleAction.None, score: 0 },
		ball: { velocity: { x: -0.3, y: 0.3 }, position: { x: 0, y: 0 }},
		time: 0,
		gameOver: false,
		winner: "",
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
		}, timeDlta * 1000);
		return () => clearInterval(interval);
	}, []);

	const lPaddle = 0.5 - paddleHeight / 4;
	const kPaddle = lPaddle / (1 - paddleHeight / 2);

	const leftPaddleTop = kPaddle * state.leftPaddle.paddlePosition + lPaddle;
	const rightPaddleTop = kPaddle * state.rightPaddle.paddlePosition + lPaddle;

	const lBallCorrection = 0.5 - ballWidth / 4;
	const kBallCorrection = lBallCorrection / (1 - ballWidth / 2);

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
				height: (paddleHeight * 50) + '%',
				width: (paddleWidth * 100) + '%',
				right: (framePaddleGap * 100) + '%'
			}}></div>
			<div className="paddle-left" style={{
				//paddle left
				top: (leftPaddleTop * 100) + '%',
				height: (paddleHeight * 50) + '%',
				width: (paddleWidth * 100) + '%',
				left: (framePaddleGap * 100) + '%'
			}}>{state.leftPaddle.paddlePosition}</div>
			<div className="pong-ball" style={{
				left: (ballPositionLeft * 100) + '%',
				top: (ballPositionTop * 100) + '%',
				width: (ballWidth * 50) + '%',
				height: (ballHeight * 50) + '%',
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