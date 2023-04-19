import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDTO } from "../../../shared/dto/create-user.dto";
import { PublicUser } from "../../../shared/public-user";

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private usersRepository: Repository<User>) { }

	async createOne(createUserDTO: CreateUserDTO) {
		const user = new User();
		user.userName = createUserDTO.userName

		return this.usersRepository.save(user);
	}

	async findAll(): Promise<PublicUser[]> {
		const query = {
			select : {
				userName: true,
				score: true,
				active: true,
				imageURL: true
			}
		};
		return this.usersRepository.find(query) as Promise<PublicUser[]>;
	}

	findFromUsername(name: string): Promise<PublicUser | null> {
		const query = {
			select : {
				userName: true,
				score: true,
				active: true,
				imageURL: true
			},
			where : {
				userName: name
			}
		};
		return this.usersRepository.findOne(query) as Promise<PublicUser | null>;
	}

	findOne(id: number): Promise<User | null> {
		return this.usersRepository.findOneBy({ id });
	}

	async removeOne(id: number): Promise<void> {
		await this.usersRepository.delete(id);
	}
}
