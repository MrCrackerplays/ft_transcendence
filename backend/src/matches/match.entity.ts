import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

import { User } from "src/users/user.entity";
import { PublicMatch } from "../../../shared/public-match";
import { UserService } from "src/users/user.service";

@Entity()
export class Match extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToMany(type => User, user => user.matches, { cascade: true })
	@JoinTable()
	players: User[];

	@Column()
	p1ID: string;

	@Column()
	p2ID: string;

	@Column()
	p1Score: number;

	@Column()
	p2Score: number;

	@Column()
	winner: number; // 1 or 2

	@Column( {default: "default"} )
	gameMode: string;

	public async toPublic(userService: UserService): Promise<PublicMatch> {
		const pubMatch: PublicMatch = {
			id: this.id,
			p1: await userService.findOne(this.p1ID),
			p2: await userService.findOne(this.p2ID),
			p1Score: this.p1Score,
			p2Score: this.p2Score,
			winner: this.winner
		}
		console.log(pubMatch);
		return (pubMatch);
	}

}