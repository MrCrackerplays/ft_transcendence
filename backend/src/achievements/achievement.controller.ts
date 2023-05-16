import { Controller, Get, Post, Body } from "@nestjs/common";
import { Achievement } from "./achievement.entity";
import { CreateAchievementDTO } from "../../../shared/dto/create-achievement.dto";
import { AchievementService } from "./achievement.service";


@Controller('achievements')
export class AchievementController {
	constructor(private readonly achievementService: AchievementService) {}

	@Post()
	async create(@Body() dto: CreateAchievementDTO) : Promise<Achievement> {
		return this.achievementService.create(dto);
	}

	@Get()
	async getAll(): Promise<Achievement[]> {
		return this.achievementService.getAll();
	}
}
