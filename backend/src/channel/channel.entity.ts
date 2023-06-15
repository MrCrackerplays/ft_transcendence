import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Message } from "src/channel/message/message.entity";
import { User } from "src/users/user.entity";
import { Visibility } from "../../../shared/dto/channel.dto";

@Entity()
export class Channel extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ unique: true })
	name: string;

	// public, private or DM
	@Column( {default: Visibility.PUBLIC} )
	visibility: Visibility;

	// only applicable to public channels
	@Column({ nullable: true })
	password: string;

	// A channel can only have one owner
	@ManyToOne(type => User, user => user.channelsOwned, { eager: true })
	owner: User;

	@ManyToMany(type => User, user => user.channelAdmin, { eager: true })
	admins: User[];

	// A channel can have many members (if it's not a DM)
	@ManyToMany(type => User, user => user.channelSubscribed)
	members: User[];

	@ManyToMany(type => User, user => user.channelBanned, { eager: true })
	banned: User[];

	@ManyToMany(type => User, user => user.channelMuted, { eager: true })
	muted: User[];

	// A channel has many messages
	@OneToMany(type => Message, message => message.channel, {
		cascade: true
	})
	@JoinColumn()
	messages: Message[];
}
