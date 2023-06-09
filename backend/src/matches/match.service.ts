import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Match } from "./match.entity";
import { CreateMatchDTO } from "../../../shared/dto/create-match.dto";
import { UserService } from "src/users/user.service";
import { User } from "src/users/user.entity";

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(Match) private matchRepository: Repository<Match>
		) { }
	
	async createMatch(winner: User, loser: User, winnerScore: number, loserScore: number): Promise<Match> {
		const match = new Match();
		match.winner = winner;
		match.loser = loser;
		match.winnerScore = winnerScore;
		match.loserScore = loserScore;

		return match.save();
	}

	findAll(): Promise<Match[]> {
		return this.matchRepository.find();
	}

	getID(matchID: string): Promise<Match> {
		return this.matchRepository.findOneBy({id: matchID });
	}
}