export type UserMessage = {
	channel: string;
	content: string;
	sender: string;
	sender_id: string;
	date: string;
}

export type Message = {
	channel: string;
	content: string;
}

export function isUserMessage(message: UserMessage | Message): message is UserMessage {
	return (message as UserMessage).sender !== undefined;
}

export type MenuItem = {label: string, action: (arg: any)=>void};
