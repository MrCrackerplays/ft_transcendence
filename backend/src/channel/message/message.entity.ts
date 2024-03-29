import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/user.entity";
import { Channel } from "src/channel/channel.entity";

@Entity({
	orderBy: {
		date: "DESC",
		id: "DESC"
	}
})
export class Message extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
	date: Date;

	@ManyToOne(type => User, user => user.messages, { eager: true, nullable: true })
	@JoinColumn()
	author: User;

	@ManyToOne(type => Channel, channel => channel.messages, { onDelete: 'SET NULL' })
	channel: Channel;

	@Column()
	content: string;
}
