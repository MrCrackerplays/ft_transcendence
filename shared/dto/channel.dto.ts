export enum Visibility {
	PUBLIC,
	PRIVATE,
	DM
}

export class CreateChannelDTO {
	name:			string;
	visibility:		Visibility;
	password:		string; // Password is only applicable to PUBLIC channels
}

export class CreateDMDTO {
	userID:			string; // UserID of the person you want to create a channel with
}
