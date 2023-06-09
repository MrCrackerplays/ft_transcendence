import { Message, UserMessage, isUserMessage } from "./messagetypes";

function UserMessageComponent({ message, sender } : { message: UserMessage; sender: string }) {
	let alignment = "leftalign";
	let sender_element = <a href={`/profile/${message.sender}`}>{message.sender}</a>;
	let date_element = <sub>{new Date(message.date).toLocaleString()}</sub>;
	let message_top = (
		<div className="message-header">
			{sender_element}
			{date_element}
		</div>
	);

	if (message.sender == sender) {
		alignment = "rightalign";
		message_top = (
			<div className="message-header">
				{date_element}
				{sender_element}
			</div>);
	}

	return (
		<div className="message">
			{message_top}
			<div className={`message-content ${alignment}`}>
				{message.content}
			</div>
		</div>
	);
}

function MessageComponent({ message } : {message: Message}) {
	return (
		<div className="message join-message">
			<i>
				{message.content}
			</i>
		</div>
	);
}

function ChatChannel( { isConnectionOpen, messages, messageBody, sendMessage, setMessageBody, sender, muted } : { isConnectionOpen: boolean; messages: UserMessage[] | Message[]; messageBody: string; sendMessage: () => void; setMessageBody: (message: string) => void; sender: string; muted: boolean; } ) {
	console.log("muted?", muted);
	return (
		<>
		<div id="chat-history">
			<div id="history-anchor"></div>
			{messages.map((message: UserMessage | Message, index : number) => (
				isUserMessage(message) ?
				<UserMessageComponent key={index} message={message} sender={sender}/>
				:
				<MessageComponent key={index} message={message} />
			))}
		</div>
		<footer className="chat-area">
			<div>
				You are chatting as {sender}
			</div>
			<div style={{display:"flex"}}>
				<textarea
					id="message-input"
					className="message-box"
					placeholder="Type your message here..."
					value={messageBody}
					onKeyDown={(e) => {
						if (e.key == "Enter" && e.shiftKey == false) {
							e.preventDefault();
							if (isConnectionOpen)
								sendMessage();
						}
					}}
					onChange={(e) => {setMessageBody(e.target.value)}}
					autoComplete="off"
					required
				/>
				<button
					aria-label="Send"
					onClick={sendMessage}
					className="send-button"
					disabled={!isConnectionOpen || muted}
				>Send</button>
			</div>
		</footer>
		</>
	);
};

export default ChatChannel;