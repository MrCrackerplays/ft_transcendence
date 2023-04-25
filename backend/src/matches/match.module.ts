import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Match } from "./match.entity";
import { MatchService } from "./match.service";
import { MatchController } from "./match.controller";
import { UserModule } from "src/users/user.module";
import { UserService } from "src/users/user.service";
import { User } from "src/users/user.entity";

@Module({
	imports: [ TypeOrmModule.forFeature([Match, User]), UserModule ],
	providers: [ MatchService, UserService ],
	controllers: [ MatchController ]
})
export class MatchModule {}