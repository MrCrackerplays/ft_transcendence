import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// Game part imports
import { GameState, PaddleAction, GameActionKind, startGameState } from '../../../shared/pongTypes';
import { makeReducer } from '../../../shared/pongReducer';

export class GameRoom {
	playerLeft: string;
	playerRight: string;
	playerLeftSocket: Socket;
	playerRightSocket: Socket;
	roomName: string;
	gameState: GameState;
	singlemode: boolean; //true for 1v1, false for 2v2
	winner: string;

	constructor(player1Id: string, player2Id: string, player1Socket: Socket, player2Socket: Socket, roomName: string) {
		this.playerLeft = player1Id;
		this.playerRight = player2Id;
		this.playerLeftSocket = player1Socket;
		this.playerRightSocket = player2Socket;
		if (player2Id == null) //gamemode == single if userID2 = null
			this.singlemode = true;
		else
			this.singlemode = false;
		this.gameState = {} as GameState;
		this.initiateGame();
		this.roomName = roomName;
		this.winner = "";
	}

	initiateGame() {
		this.gameState = {
			leftPaddle: {
				playerID: this.playerLeft,
				paddlePosition: startGameState.leftPaddle.paddlePosition,
				action: startGameState.leftPaddle.action,
				score: startGameState.leftPaddle.score,
				moved: startGameState.leftPaddle.moved,
			},
			rightPaddle: {
				playerID: this.playerRight,
				paddlePosition: startGameState.rightPaddle.paddlePosition,
				action: startGameState.rightPaddle.action,
				score: startGameState.rightPaddle.score,
				moved: startGameState.rightPaddle.moved,
			},
			ball: {
				velocity: startGameState.ball.velocity,
				position: startGameState.ball.position,
			},
			time: startGameState.time,
			gameOver: startGameState.gameOver,
			gameClosing: startGameState.gameClosing,
			winner: startGameState.winner,
			singlemode: startGameState.singlemode,
		}
		if (this.singlemode)
			this.gameState.singlemode = true;
		else
			this.gameState.singlemode = false;
	};

	handleMessage(socket: Socket, movement: PaddleAction) {

		let currentPlayer: string;
		if (socket === this.playerLeftSocket) {
			currentPlayer = this.playerLeft;
		} else if (socket === this.playerRightSocket) {
			currentPlayer = this.playerRight;
		} else {
			console.log('socket not found');
			//socket doesn't belong to players - possible?
			return;
		}
		// Logger.log('movement: ', movement, 'currentPlayer: ', currentPlayer);
		const reducer = makeReducer(currentPlayer);
		if ( movement == "up" ) {
			const newGameState: GameState = reducer(this.gameState, {
				kind: GameActionKind.arrowUp,
				value: null,
			});
			this.gameState = newGameState;
		} else if ( movement == "down" ) {
			const newGameState: GameState = reducer(this.gameState, {
				kind: GameActionKind.arrowDown,
				value: null, 
			});
			this.gameState = newGameState;
		} else if ( movement == "none" ) {
			const newGameState: GameState = reducer(this.gameState, {
				kind: GameActionKind.StopMovement,
				value: null,
			});
			this.gameState = newGameState;
		}

		if (this.singlemode) {
			this.playerLeftSocket.emit('pong_state', this.gameState); //WAS gameState
		} else {
			this.playerLeftSocket.emit('gameState', this.gameState);
			this.playerRightSocket.emit('gameState', this.gameState);
		}
	}

	handleGameOver(socket: Socket, payload: any) {
		this.gameState.gameOver = true;
		this.gameState.winner = payload.winner;
	};
};