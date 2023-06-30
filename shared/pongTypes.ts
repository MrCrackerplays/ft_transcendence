
export enum PaddleAction {
	Up,
	Down,
	None,
}

export type GameAction = {
	kind : GameActionKind,
	value : any,
};

export enum GameActionKind {
	arrowUp,
	arrowDown,
	StopMovement,
	updateTime,
	overrideState,
}

export type PaddleState = { //move to Players?
	playerID: string,
	paddlePosition: number,
	action: PaddleAction,
	score: number, //move to Players?
	moved: boolean,
};

export type BallState = {
	velocity: { x: number, y: number },
	position: { x: number, y: number },
};

export type GameState = {
	leftPaddle: PaddleState,
	rightPaddle: PaddleState,
	ball: BallState,
	time: number,
	gameOver: boolean,
	winner: string,
	singlemode: boolean,
};

export const pongConstants = {
	paddleHeight : 0.3,
	paddleWidth : 0.02,
	framePaddleGap : 0.03,
	paddleSpeed : 0.5,
	ballHeight : 0.04,
	ballWidth : 0.04,
	timeDlta : 0.02,
};