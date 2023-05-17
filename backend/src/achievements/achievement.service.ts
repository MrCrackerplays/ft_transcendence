import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Achievement } from "./achievement.entity";
import { CreateAchievementDTO } from "../../../shared/dto/create-achievement.dto"

@Injectable()
export class AchievementService {
	constructor(
		@InjectRepository(Achievement) private achievementRepository: Repository<Achievement>,
		) { }

	async create(dto: CreateAchievementDTO) : Promise<Achievement> {
		const ach : Achievement = new Achievement();
		ach.name = dto.name;
		ach.description = dto.description;
		ach.imageURL = dto.imageURL;

		return this.achievementRepository.save(ach);
	}

	async getAll(): Promise<Achievement[]> {
		return this.achievementRepository.find();
	}

}
