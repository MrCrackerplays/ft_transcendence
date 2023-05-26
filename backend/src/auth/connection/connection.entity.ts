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

	@Column({ nullable: true })
	user42ID: number;

	@Column({ default: false })
	twoFactorEnabled: boolean;

	// ONE TIME PASSWORD FOR 2FA
	@Column({ nullable: true})
	otpSecret: string;
}