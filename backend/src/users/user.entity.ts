import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm";
import { PublicUser } from "../../../shared/public-user"

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userName: string;

	@Column( {default: 0} )
	score: number;

	@Column( {default: true} )
	active: boolean;

	@Column( {default: ""} )
	imageURL: string;

	public getPublic(): PublicUser {
		const publicUser: PublicUser = {
			userName: this.userName,
			score: this.score,
			imageURL: this.imageURL,
			active: this.active
		};

		return publicUser;
	}
}
