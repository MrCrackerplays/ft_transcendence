import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Achievement } from "./achievement.entity";
import { UserModule } from "src/users/user.module";
import { AchievementService } from "./achievement.service";
import { AchievementController } from "./achievement.controller";

@Module({
	imports: [ TypeOrmModule.forFeature([Achievement]), UserModule ],
	providers: [ AchievementService ],
	controllers: [ AchievementController ],
	exports: [ AchievementService ]
})
export class AchievementModule {}
