import { BaseEntity, Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/user.entity";
import { Channel } from "src/channel/channel.entity";

@Entity()
export class Message extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(type => User, user => user.messages)
	author: User;

	@ManyToOne(type => Channel, channel => channel.messages)
	channel: Channel;

	@Column()
	content: string;
}
