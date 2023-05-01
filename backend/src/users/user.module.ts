import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { Connection } from "src/auth/connection.entity";

@Module({
	imports: [ TypeOrmModule.forFeature([User]) ],
	providers: [ UserService ],
	controllers: [ UserController ]
})
export class UserModule {}
