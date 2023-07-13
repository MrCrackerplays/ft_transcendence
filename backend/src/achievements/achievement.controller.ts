import { Controller, Get, Post, Body } from "@nestjs/common";

import { Achievement } from "./achievement.entity";
import { CreateAchievementDTO } from "../../../shared/dto/create-achievement.dto";
import { AchievementService } from "./achievement.service";
import { Public } from "src/auth/decorators/public.decorator";

@Controller('achievements')
export class AchievementController {
	constructor(private readonly achievementService: AchievementService) {}

	// !: DEBUG ONLY
	// @Public()
	// @Post()
	// async create(@Body() dto: CreateAchievementDTO) : Promise<Achievement> {
	// 	return this.achievementService.create(dto);
	// }

	// Getting ALL available achievements is a public API call
	@Public()
	@Get()
	async getAll(): Promise<Achievement[]> {
		return this.achievementService.getAll();
	}
}
