import { Message } from "src/message/message.entity";
import { User } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Channel extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	// public, private, (password) protected
	@Column( {default: "public"} )
	visibility: string;

	@ManyToOne(type => User, user => user.channelsOwned)
	@JoinColumn()
	owner: User;

	@ManyToMany(type => User, user => user.channelSubscribed)
	members: User[];

	@OneToMany(type => Message, message => message.channel, {
		cascade: true
	})
	@JoinColumn()
	messages: Message[];
}
