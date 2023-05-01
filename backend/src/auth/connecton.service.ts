import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Connection } from "./connection.entity";
import { Repository } from "typeorm";

@Injectable()
export class ConnectionService {

	constructor(
		@InjectRepository(Connection) private readonly connectionRepository: Repository<Connection>
	) {}
	
	async get(where: any) : Promise<Connection> {
		const con = await this.connectionRepository.findOne({where});
		if (!con)
			throw new HttpException('User Connection not found', HttpStatus.NOT_FOUND);
		return (con);
	}

	async create(_userUUID: string, _user42ID: number): Promise<Connection> {
		let con = await this.get({user: _userUUID});
		if (con)
			throw new HttpException('User Connection already exists', HttpStatus.CONFLICT);
		con = this.connectionRepository.create({ user: { id: _userUUID }, user42ID: _user42ID });
		await this.connectionRepository.save(con);
		return (con)
	}

	async update(connectionID: number, data: any): Promise<any> {
		try { await this.connectionRepository.update(connectionID, data)}
		catch (error) { throw new HttpException(error.message, HttpStatus.BAD_REQUEST); }
	}

}