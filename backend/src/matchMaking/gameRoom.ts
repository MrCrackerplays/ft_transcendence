import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io';
import { Constants } from '../../../shared/constants'

import { JwtService } from '@nestjs/jwt';
import { ConnectionService } from 'src/auth/connection/connection.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';
import { Logger } from '@nestjs/common';
import { parse } from 'cookie'
import exp from 'constants';
import { emit } from 'process';

// Game part imports
import { GameState, PaddleAction, GameActionKind } from '../../../shared/pongTypes';
import { makeReducer } from '../../../shared/pongReducer';


export class GameRoom {
	playerLeft: string;
	playerRight: string;
	playerLeftSocket: Socket;
	playerRightSocket: Socket;
	roomName: string;
	gameState: GameState;
	singlemode: boolean; //true for 1v1, false for 2v2

	constructor(player1Id: string, player2Id: string, player1Socket: Socket, player2Socket: Socket) {
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
	}

	initiateGame() {
		this.gameState = {
			leftPaddle: {
				playerID: this.playerLeft,
				paddlePosition: 0,
				action: PaddleAction.None,
				score: 0,
				moved: false,
			},
			rightPaddle: {
				playerID: this.playerRight,
				paddlePosition: 0,
				action: PaddleAction.None,
				score: 0,
				moved: false,
			},
			ball: {
				velocity: { x: 0.5, y: 0 },
				position: { x: 0, y: 0 },
			},
			time: 0,
			gameOver: false,
			winner: '',
			singlemode: this.singlemode,
		}
	};

	handleMessage(socket: Socket, payload: any) {
		const { movement } = payload.payload;

		let currentPlayer: string;
		if (socket === this.playerLeftSocket) {
			currentPlayer = this.playerLeft;
		} else if (socket === this.playerRightSocket) {
			currentPlayer = this.playerRight;
		} else {
			//socket doesn't belong to players - possible?
			return;
		}

		// Apply the reducer function to update the game state
		const reducer = makeReducer(currentPlayer);
		const newGameState: GameState = reducer(this.gameState, {
			kind: GameActionKind.overrideState,
			value: this.gameState,
		});

		// Update the game state in the room
		this.gameState = newGameState;

		// Broadcast the updated game state to both clients in the room
		if (this.singlemode) {
			this.playerLeftSocket.emit('gameState', this.gameState);
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