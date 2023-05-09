import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDTO } from "../../../shared/dto/create-user.dto";
import { PublicUser } from "../../../shared/public-user";
import { PublicMatch } from "../../../shared/public-match";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>) { }

	async createOne(createUserDTO: CreateUserDTO) {
		console.log(`UserService: creating new user (${createUserDTO.userName})`);
		const user = this.usersRepository.create();
		user.userName = createUserDTO.userName;
		try { await this.usersRepository.save(user); }
		catch (error) { throw new HttpException(error.message, HttpStatus.BAD_REQUEST); }
		return user;
	}

	async get(userID: string): Promise<User> {
		const user = await this.usersRepository.findOneBy({id: userID});

		if (!userID || !user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user;
	}

	async create() {
		const user = this.usersRepository.create();
		try { await this.usersRepository.save(user); }
		catch (error) { throw new HttpException(error.message, HttpStatus.BAD_REQUEST); }
		console.log(`UserService: created new user (${user.id})`);
		return user;
	}

	async findAll(): Promise<PublicUser[]> {
		const query = {
			select : {
				id: true,
				userName: true,
				gamesPlayed: true,
				gamesWon: true,
				score: true,
				active: true,
				imageURL: true
			}
		};
		return this.usersRepository.find(query) as Promise<PublicUser[]>;
	}

	findFromUsername(name: string): Promise<User | null> {
		const query = {
			where : {
				userName: name
			}
		};
		return this.usersRepository.findOne(query);
	}

	async findOne(id: string): Promise<User | null> {
		return this.usersRepository.findOneBy({ id });
	}

	async removeOne(id: string): Promise<void> {
		await this.usersRepository.delete(id);
	}

	// ### USER IS KNOWN ###
	addFriend(user: User, friend: User): Promise<void> {

		return this.usersRepository.createQueryBuilder()
			.relation(User, "friends")
			.of(user.id)
			.add(friend.id);

		// user.friends.push(friend);
		// friend.friends.push(user);
		// user.save()
		// return friend.save();
	}

	getFriends(user: User): Promise<User[]> {
		return this.usersRepository.createQueryBuilder()
			.relation(User, "friends")
		  	.of(user)
			.loadMany();
	}

	async getRecentMatches(user: User): Promise<PublicMatch[]> {
		// let matches: Match[] = await this.usersRepository.createQueryBuilder()
		// 	.relation(Match, "players")
		// 	.of(user)
		// 	.loadMany();
		
		const userWithMatches: User = await this.usersRepository.findOne({
			relations: ['matches'],
			where: { id: user.id }
		});
		const matches = userWithMatches.matches;

		console.log(matches);

		let publicMatches: PublicMatch[] = [];
		for (let m of matches) {
			publicMatches.push(await m.toPublic(this));
		}

		// await matches.forEach( async (value: Match) => {
		// 	publicMatches.push(await value.toPublic(this))
		// });

		console.log(publicMatches);

		return (publicMatches);
	}
}
