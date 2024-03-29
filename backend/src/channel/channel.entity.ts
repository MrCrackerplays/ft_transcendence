import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Message } from "src/channel/message/message.entity";
import { User } from "src/users/user.entity";
import { Visibility } from "../../../shared/dto/channel.dto";
import { PublicChannel } from "./public-channel.interface";

@Entity()
export class Channel extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ })
	name: string;

	// public, private or DM
	@Column( {default: Visibility.PUBLIC} )
	visibility: Visibility;

	// only applicable to public channels
	@Column({ nullable: true })
	password: string;

	// A channel can only have one owner
	@ManyToOne(type => User, user => user.channelsOwned, { onDelete: 'CASCADE', eager: true, nullable: true })
	@JoinColumn()
	owner: User;

	@ManyToMany(type => User, user => user.channelAdmin, { onDelete: 'CASCADE', eager: true })
	@JoinTable()
	admins: User[];

	// A channel can have many members (if it's not a DM)
	@ManyToMany(type => User, user => user.channelSubscribed, { onDelete: 'CASCADE'})
	@JoinTable()
	members: User[];

	@ManyToMany(type => User, user => user.channelBanned, { onDelete: 'CASCADE', eager: true })
	@JoinTable()
	banned: User[];

	@ManyToMany(type => User, user => user.channelMuted, { onDelete: 'CASCADE', eager: true })
	@JoinTable()
	muted: User[];

	// A channel has many messages
	@OneToMany(type => Message, message => message.channel, { onDelete: 'CASCADE', cascade: true})
	@JoinColumn()
	messages: Message[];

	toPublic(): PublicChannel {
		const pc: PublicChannel = {
			id: this.id,
			name: this.name,
			visibility: this.visibility,
			password: (this.password != null),
			owner: this.owner,
			admins: this.admins,
			members: this.members,
			banned: this.banned,
			muted: this.muted
		};
		return pc;
	}
}
