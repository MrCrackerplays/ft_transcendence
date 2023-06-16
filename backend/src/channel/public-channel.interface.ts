import { User } from "src/users/user.entity";
import { Visibility } from "../../../shared/dto/channel.dto";

export interface PublicChannel {
	id: string,
	name: string,
	visibility: Visibility,
	password: boolean,
	owner: User,
	admins: User[],
	members: User[],
	banned: User[],
	muted: User[]
};