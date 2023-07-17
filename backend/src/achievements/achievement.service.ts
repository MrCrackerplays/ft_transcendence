import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Achievement } from "./achievement.entity";
import { CreateAchievementDTO } from "../../../shared/dto/create-achievement.dto"

import achievements = require('../../../shared/achievements.json');

@Injectable()
export class AchievementService {
	static firstTime: boolean = true;

	constructor(
		@InjectRepository(Achievement) private achievementRepository: Repository<Achievement>,
		) {}

	async onApplicationBootstrap() {
		if (!AchievementService.firstTime)
			return;
		AchievementService.firstTime = false;
		for (const ach of achievements) {
			this.create({
				name : ach.name,
				description : ach.description,
				imageURL : ach.imageurl
			});
		}
	}

	async create(dto: CreateAchievementDTO) : Promise<Achievement> {

		const existing = await this.achievementRepository.findOneBy({
			name: dto.name
		});

		if (!existing)
			return this.achievementRepository.save(Achievement.createFromDTO(dto));
		existing.description = dto.description;
		existing.imageURL = dto.imageURL;
		existing.save();
		return existing;
	}

	async getAll(): Promise<Achievement[]> {
		return this.achievementRepository.find();
	}

}
