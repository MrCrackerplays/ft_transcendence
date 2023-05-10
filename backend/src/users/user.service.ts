import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDTO } from "../../../shared/dto/create-user.dto";
import { ConnectionService } from "src/auth/connection.service";
import { AuthRequest } from "src/interfaces/authrequest.interface";
import { Connection } from "src/auth/connection.entity";
import { Match } from "src/matches/match.entity";
import { Channel } from "src/channel/channel.entity";
import { Message } from "src/message/message.entity";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectRepository(Match) private matchRepository: Repository<Match>,

		private readonly connectionService: ConnectionService
		) { }

	async createOne(createUserDTO: CreateUserDTO) {
		console.log(`UserService: creating new user (${createUserDTO.userName})`);
		const user = this.usersRepository.create();
		user.userName = createUserDTO.userName;
		try { await this.usersRepository.save(user); }
		catch (error) { throw new HttpException(error.message, HttpStatus.BAD_REQUEST); }
		return user;
	}

	async get(userID: string, relations = [] as string[]): Promise<User> {
		const user = await this.usersRepository.findOne({where : {id: userID}, relations});

		if (!userID || !user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user;
	}

	async getCurrentUser(req: AuthRequest): Promise<User> {
		// Get the connection from the Request payload and attatch the 'user' relation, then return that user
		const connection : Connection = await this.connectionService.get({ id: req.user.id }, ['user']);
		return (connection.user);
	}

	profileComplete(user: User) : boolean {
		return (user.userName.length > 0);
	}

	async create() {
		const user = this.usersRepository.create();
		try { await this.usersRepository.save(user); }
		catch (error) { throw new HttpException(error.message, HttpStatus.BAD_REQUEST); }
		console.log(`UserService: created new user (${user.id})`);
		return user;
	}

	async findAll(): Promise<User[]> {
		return this.usersRepository.find() as Promise<User[]>;
	}

	async getOne(where: any, relations = [] as string[]): Promise<User> {
		const user = await this.usersRepository.findOne({where, relations});

		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user;
	}

	getFromUsername(name: string): Promise<User | null> {
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
	async addFriend(user: User, friend_id: string): Promise<void> {

		if (friend_id == user.id)
			throw new HttpException('Can not friend yourself', HttpStatus.FORBIDDEN);
		
		const friend = await this.get(friend_id);
		if (!friend)
			throw new HttpException('Friend does not exist', HttpStatus.FORBIDDEN);

		return this.usersRepository.createQueryBuilder()
			.relation(User, "friends")
			.of(user.id)
			.add(friend_id);

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

	async setName(user: User, name: string): Promise<User> {
		if (!name || name.length == 0)
			throw new HttpException('Provide an actual name', HttpStatus.FORBIDDEN);
		
		const userWithName = await this.usersRepository.findOne({
			where: {
				userName: name
			}
		});

		if (userWithName)
			throw new HttpException('Username taken', HttpStatus.FORBIDDEN);
		user.userName = name;
		return user.save();
	}

	async getChannels(user: User): Promise<Channel[]> {
		user = await this.get(user.id, ['channelSubscribed']);
		return (user.channelSubscribed);
	}

	async getMessages(user: User): Promise<Message[]> {
		user = await this.get(user.id, ['messages']);
		return (user.messages);
	}

	async getRecentMatches(user: User): Promise<Match[]> {

		const matches = await this.matchRepository.find({
			relations: ['players'],
			where : {
				players : {
					id: user.id
				}
			},
			take: 10
		});
		return (matches);
	}
}
