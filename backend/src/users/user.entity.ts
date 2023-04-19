import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm";

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
}
