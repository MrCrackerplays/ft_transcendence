import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, ManyToMany, PrimaryColumn, BaseEntity, JoinTable, JoinColumn } from "typeorm";
import { PublicUser } from "../../../shared/public-user"
import { Message } from "src/message/message.entity";
import { Channel } from "src/channel/channel.entity";

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn()
	userName: string;

	@Column( {default: 0} )
	score: number;

	@Column( {default: true} )
	active: boolean;

	@Column( {default: ""} )
	imageURL: string;

	@OneToMany(type => Channel, channel => channel.owner)
	channelsOwned: Channel[];

	@ManyToMany(type => Channel, channel => channel.members)
	channelSubscribed: Channel[];

	@OneToMany(type => Message, message => message.author, {
		cascade: true
	})
	@JoinColumn()
	messages: Message[];

}
