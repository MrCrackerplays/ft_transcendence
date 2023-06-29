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
	let m : UserMessage = message as UserMessage;
	return m.sender !== undefined && m.sender !== "null" && m.sender_id !== undefined && m.sender_id !== "null";
}

export type MenuItem = { label: string, action: (arg: any) => void };
