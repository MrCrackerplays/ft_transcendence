import { Injectable } from "@nestjs/common";
import { Socket } from 'socket.io'

@Injectable()
export class GameService {
	private rooms: Map<string, Socket[]> = new Map();

	addClientToGame() {
	}
}