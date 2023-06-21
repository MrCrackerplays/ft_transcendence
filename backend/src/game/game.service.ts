import { Injectable } from "@nestjs/common";
import { Socket } from 'socket.io'
import { MatchMakingService } from "src/matchMaking/matchmaking.service";

@Injectable()
export class GameService {
	private rooms: Map<string, Socket[]> = new Map();

	addClientToGame() {
	}
}