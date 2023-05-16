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
		@InjectRepository(Match) private matchRepository: Repository<Match>,
		private readonly userService: UserService
		) { }
	
	async createMatch(createMatchDTO: CreateMatchDTO): Promise<Match> {
		const match = new Match();

		const userWinner: User = await this.userService.findOne(createMatchDTO.winnerID);
		const userLoser: User = await this.userService.findOne(createMatchDTO.loserID);
		
		match.winner = userWinner;
		match.loser = userLoser;

		match.winnerScore = createMatchDTO.winnerScore;
		match.loserScore = createMatchDTO.loserScore;

		return match.save();
	}

	findAll(): Promise<Match[]> {
		return this.matchRepository.find();
	}

	getID(matchID: string): Promise<Match> {
		return this.matchRepository.findOneBy({id: matchID });
	}
}