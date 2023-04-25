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
		match.p1ID = createMatchDTO.p1ID;
		match.p2ID = createMatchDTO.p2ID;
		match.p1Score = createMatchDTO.p1Score;
		match.p2Score = createMatchDTO.p2Score;
		match.winner = createMatchDTO.winner;

		const p1: User = await this.userService.findOne(createMatchDTO.p1ID);
		const p2: User = await this.userService.findOne(createMatchDTO.p2ID);
		match.players = [p1, p2];

		return match.save();
	}

	findAll(): Promise<Match[]> {
		return this.matchRepository.find();
	}

	getID(matchID: string): Promise<Match> {
		return this.matchRepository.findOneBy({id: matchID });
	}
}