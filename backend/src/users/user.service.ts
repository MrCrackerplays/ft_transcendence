import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { User } from "./user.entity";
import { Any, ArrayContains, In, Repository } from "typeorm";
import { CreateUserDTO } from "../../../shared/dto/create-user.dto";
import { ConnectionService } from "src/auth/connection.service";
import { AuthRequest } from "src/auth/interfaces/authrequest.interface";
import { Connection } from "src/auth/connection.entity";
import { Match } from "src/matches/match.entity";
import { Channel } from "src/channel/channel.entity";
import { Message } from "src/channel/message/message.entity";
import { Achievement } from "src/achievements/achievement.entity";
import { ChannelService } from "src/channel/channel.service";
import { CreateChannelDTO } from "../../../shared/dto/channel.dto";
import { CreateMessageDTO } from "../../../shared/dto/create-message.dto";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectRepository(Match) private matchRepository: Repository<Match>,
		@InjectRepository(Achievement) private achievementRepository: Repository<Achievement>,

		private readonly connectionService: ConnectionService,
		private readonly channelService: ChannelService
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

	async setTwoFactor(_user: User, enable: boolean): Promise<User> {
		const connection : Connection = await this.connectionService.get({ user: { id: _user.id } }, ['user']);
		connection.twoFactorEnabled = enable;
		connection.save();
		return connection.user;
	}

	setProfilePicture(_user: User, file: Express.Multer.File): Promise<User> {
		if (_user.imageURL)
			console.log("User already has image (PROBABLY SHOULD DELETE?)");

		_user.imageURL = file.filename;
		return _user.save();
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

	async addAchievement(user: User, achievementID: number): Promise<User> {
		const ach = await this.achievementRepository.findOne({ where: { id : achievementID } });
		user.achievements.push(ach);
		return user.save();
	}

	async getChannels(user: User): Promise<Channel[]> {
		user = await this.get(user.id, ['channelSubscribed']);
		return user.channelSubscribed;
	}

	async createChannel(user: User, dto: CreateChannelDTO): Promise<Channel> {
		return this.channelService.create(user, dto);
	}

	async getChannelMessages(channelID: string, user: User): Promise<Message[]> {
		return this.channelService.getMessagesProtected(channelID, user);
	}

	async createChannelMessage(channelID: string, user: User, dto: CreateMessageDTO): Promise<Message> {
		return this.channelService.createMessageProtected(channelID, user, dto);
	}

	async getMessages(user: User): Promise<Message[]> {
		user = await this.get(user.id, ['messages']);
		return (user.messages);
	}

	async getAchievements(user: User): Promise<Achievement[]> {
		const userWithAchievements = await this.get(user.id, ['achievements']);
		return userWithAchievements.achievements;
	}

	async getRecentMatches(user: User): Promise<Match[]> {

		const matches = await this.matchRepository
		.find({
			relations: ['winner', 'loser'],
			where : [
				{ winner : { id: user.id } },
				{ loser : { id: user.id } }
			],
			take: 10
		});

		// const matchIDs: string[] = [];
		// matches.forEach((value) => {
		// 	matchIDs.push(value.id);
		// });

		// const loadedMatches = await this.matchRepository
		// .find({
		// 	relations: ['players'],
		// 	where: {
		// 		id: In(matchIDs)
		// 	}
		// })

		return (matches);
	}
}
