import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

import { User } from "src/users/user.entity";
import { CreateAchievementDTO } from "../../../shared/dto/create-achievement.dto";

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

	public static createFromDTO(dto : CreateAchievementDTO) : Achievement {
		const ach : Achievement = new Achievement();
		ach.name = dto.name;
		ach.description = dto.description;
		ach.imageURL = dto.imageURL;

		return (ach);
	}

}
