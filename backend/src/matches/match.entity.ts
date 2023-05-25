import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "src/users/user.entity";

@Entity({
	orderBy: {
		date: "DESC",
		id: "DESC"
	}
})
export class Match extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
	date: Date;

	@ManyToOne(type => User, user => user.wonMatches, { eager: true })
	winner: User;

	@ManyToOne(type => User, user => user.lostMatches, { eager: true })
	loser: User;

	@Column('int', { default: 0, nullable: true })
	winnerScore: number;

	@Column('int', { default: 0, nullable: true })
	loserScore: number;

	@Column( {default: "default"} )
	gameMode: string;

}