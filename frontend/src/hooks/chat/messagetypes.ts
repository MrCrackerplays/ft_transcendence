export type UserMessage = {
	channel: string;
	content: string;
	sender: string;
	date: string;
}

export type Message = {
	channel: string;
	content: string;
}

export function isUserMessage(message: UserMessage | Message): message is UserMessage {
	return (message as UserMessage).sender !== undefined;
}
