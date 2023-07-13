
export enum PaddleAction {
	Up = 'up',
	Down = 'down',
	None = 'none',
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

export const startGameState = {

	leftPaddle: { 
		paddlePosition: 0, 
		action: PaddleAction.None, 
		score: 0, 
		moved: false },
	rightPaddle: { 
		paddlePosition: 0, 
		action: PaddleAction.None, 
		score: 0, 
		moved: false },
	ball: { 
		velocity: { x: 1.5, y: 0.0 }, 
		position: { x: 0, y: 0 } },
	time: 0,
	gameOver: false,
	winner: "",
	singlemode: true,
};

export enum GameMode {
	CLASSIC = "classic",
	SOLO = "solo",
	INVITE = "private",
};