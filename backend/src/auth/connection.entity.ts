import { number } from "@hapi/joi";
import { User } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Connection extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(type => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user: User;

	@Column({ nullable: true})
	user42ID: number;

	// ONE TIME PASSWORD
	@Column({ nullable: true})
	otp: string;
}