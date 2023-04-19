import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateUserDTO } from "./dto/create-user.dto";

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private usersRepository: Repository<User>) { }

	async createOne(createUserDTO: CreateUserDTO) {
		const user = new User();
		user.userName = createUserDTO.userName

		// const qr = this.dataSource.createQueryRunner();

		// await qr.connect();
		// await qr.startTransaction();

		// try {
		// 	await qr.manager.save(user);
		// 	await qr.commitTransaction();
		// } catch (err) {
		// 	console.log(`transaction failed: createOne() with userName [${user.userName}]`);
		// 	await qr.rollbackTransaction();
		// } finally {
		// 	await qr.release();
		// }

		return this.usersRepository.save(user);
	}

	async findAll(): Promise<User[]> {
		return this.usersRepository.find();
	}

	findFromUsername(name: string): Promise<User | null> {
		return this.usersRepository.findOne({
			where: {
				userName: name
			}
		});
	}

	findOne(id: number): Promise<User | null> {
		return this.usersRepository.findOneBy({ id });
	}

	async removeOne(id: number): Promise<void> {
		await this.usersRepository.delete(id);
	}
}
