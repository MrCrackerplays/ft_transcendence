import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Match } from "./match.entity";
import { MatchService } from "./match.service";
import { MatchController } from "./match.controller";

@Module({
	imports: [
		TypeOrmModule.forFeature([ Match ])
	],
	providers: [ MatchService ],
	controllers: [ MatchController ],
	exports: [
		TypeOrmModule.forFeature([ Match ]),
		MatchService
	]
})
export class MatchModule {}