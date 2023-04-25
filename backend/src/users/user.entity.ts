import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, BaseEntity, JoinColumn, ManyToOne, JoinTable } from "typeorm";

import { Message } from "src/message/message.entity";
import { Channel } from "src/channel/channel.entity";
import { Match } from "src/matches/match.entity";

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column( { unique: true } )
	userName: string;

	@Column( {default: 0} )
	score: number;

	@Column( {default: true} )
	active: boolean;

	@Column( {default: ""} )
	imageURL: string;

	@Column( {default: 0})
	gamesPlayed: number;

	@Column( {default: 0})
	gamesWon: number;

	// Every user can own mutliple channels, every channel only has one owner
	// ONE user has MANY channels
	@OneToMany(type => Channel, channel => channel.owner)
	channelsOwned: Channel[];

	// Every user can be subscribed to multiple channels, and every channel can have multiple subscribers
	// MANY users subscribe to MANY channels
	@ManyToMany(type => Channel, channel => channel.members)
	channelSubscribed: Channel[];

	// Every user can have multiple friends
	// ONE user, MANY friends
	@ManyToMany(type => User)
	@JoinTable({ joinColumn: { name: 'users_id_1' } })
	friends: User[];

	@ManyToMany(type => Match, match => match.players)
	matches: Match[];

	// Every user can write multiple messages, every message only has a single author
	// ONE user has MANY messages
	@OneToMany(type => Message, message => message.author, { cascade: true })
	@JoinColumn()
	messages: Message[];

}
