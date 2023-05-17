import { User } from "src/users/user.entity";
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Achievement extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	description: string;

	@Column()
	imageURL: string;

	@ManyToMany(type => User, user => user.achievements)
	members: User[];
}
