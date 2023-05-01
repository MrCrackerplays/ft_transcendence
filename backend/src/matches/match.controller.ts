import { Body, Controller, Get, Post } from "@nestjs/common";

import { Match } from "./match.entity";
import { MatchService } from "./match.service";
import { CreateMatchDTO } from "../../../shared/dto/create-match.dto";

@Controller('matches')
export class MatchController {
	constructor(private readonly matchService: MatchService) {}

	@Post()
	async createOne(@Body() createMatchDTO: CreateMatchDTO) {
		return this.matchService.createMatch(createMatchDTO);
	}

	@Get()
	findAll(): Promise<Match[]> {
		return this.matchService.findAll();
	}

}