
import React from "react";
import { useReducer, useEffect } from 'react';
import "./pong.css";

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

type PaddleState = {
	playerID: string,
	paddlePosition: number,
	action: PaddleAction,
	score: number,
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
const paddleSpeed = 1;

function checkPaddleBoarder(paddlePosition) {
	const paddleMaxUp = 1 - paddleHeight / 2;
	const paddleMaxDown = -1 + paddleHeight / 2;
	if (paddlePosition > paddleMaxUp) {
		return paddleMaxUp;
	} else if (paddlePosition < paddleMaxDown) {
		return paddleMaxDown;
	} else {
		return paddlePosition;
	}
}
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
				newState.ball.position.x += newState.ball.velocity.x * timeDlta;
				newState.ball.position.y += newState.ball.velocity.y * timeDlta;
				//ball collision : wall collision + paddle collision 
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
		ball: { velocity: { x: 10, y: 0 }, position: { x: 0, y: 0 } },
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

	const leftPaddleTop = k * state.leftPaddle.paddlePosition + l;
	const rightPaddleTop = k * state.rightPaddle.paddlePosition + l;
	//RENDER 
	return (
		<div className="pong-frame">
			<div className="centre-line"></div>
			<div className="h-centre-line"></div>
			<div className="paddle-right" style={{ top: rightPaddleTop + '%' }}></div>
			<div className="paddle-left" style={{ top: leftPaddleTop + '%'  }}></div>
			<div className="pong-ball" style={{ left: (state.ball.position.x * 0.1 + 50) + '%', top: (state.ball.position.y * 0.1 + 50) + '%' }}></div>
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