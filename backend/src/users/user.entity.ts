import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, BaseEntity, JoinColumn, JoinTable, OneToOne } from "typeorm";

import { Message } from "src/channel/message/message.entity";
import { Channel } from "src/channel/channel.entity";
import { Match } from "src/matches/match.entity";
import { Connection } from "src/auth/connection/connection.entity";
import { Achievement } from "src/achievements/achievement.entity";

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column( { unique: true, nullable: true } )
	userName: string;

	@Column( {default: 0} )
	score: number;

	@Column( {default: 'online'} )
	status: string;

	@Column( {default: ''} )
	imageURL: string;

	@Column( {default: 0})
	gamesPlayed: number;

	@Column( {default: 0})
	gamesWon: number;

	// Every user can own mutliple channels, every channel only has one owner
	// ONE user has MANY channels
	@OneToMany(type => Channel, channel => channel.owner, { nullable: true, cascade: ['remove'] })
	channelsOwned: Channel[];

	// Every user can be subscribed to multiple channels, and every channel can have multiple subscribers
	// MANY users subscribe to MANY channels
	@ManyToMany(type => Channel, channel => channel.members, { nullable: true })
	@JoinTable()
	channelSubscribed: Channel[];

	@ManyToMany(type => Channel, channel => channel.admins, { nullable: true })
	@JoinTable()
	channelAdmin: Channel[];

	@ManyToMany(type => Channel, channel => channel.muted, { nullable: true })
	@JoinTable()
	channelMuted: Channel[];

	@ManyToMany(type => Channel, channel => channel.banned, { nullable: true })
	@JoinTable()
	channelBanned: Channel[];

	@ManyToMany(type => Achievement, achievement => achievement.members, {  eager: true })
	@JoinTable()
	achievements: Achievement[];

	// Every user can have multiple friends
	@ManyToMany(type => User)
	@JoinTable({ joinColumn: { name: 'users_id_1' } })
	friends: User[];

	// Every user can have multiple blocked people
	@ManyToMany(type => User)
	@JoinTable({ joinColumn: { name: 'users_id_1' } })
	blocked: User[];

	@OneToMany(type => Match, match => match.winner, { nullable: true })
	wonMatches: Match[];

	@OneToMany(type => Match, match => match.loser, { nullable: true })
	lostMatches: Match[];

	@OneToOne( type => Connection, connection => connection.user )
	connection: Connection;

	// Every user can write multiple messages, every message only has a single author
	// ONE user has MANY messages
	@OneToMany(type => Message, message => message.author, { cascade: true, nullable: true})
	messages: Message[];

}
