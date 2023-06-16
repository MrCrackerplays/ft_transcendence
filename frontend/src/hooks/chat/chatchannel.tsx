import { useRef } from "react";
import { Message, UserMessage, isUserMessage } from "./messagetypes";
import ChannelEditor from "./channeleditor";

function UserMessageComponent({ message, sender } : { message: UserMessage; sender: string }) : JSX.Element {
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

function MessageComponent({ message } : {message: Message}) : JSX.Element {
	return (
		<div className="message join-message">
			<i>
				{message.content}
			</i>
		</div>
	);
}

function channelOptions(role: string, isConnectionOpen: boolean, currentChannel: string, setCurrentChannel: (channel: string) => void, deleteChannel: (channel: string) => Promise<boolean>, leaveChannel: (channel: string) => Promise<boolean>, makeModalVisible: () => void) : JSX.Element {
	let extraoptions = <></>;
	if (role == "owner" || role == "admin") {
		extraoptions = (
		<>
		<button
			aria-label="Delete channel"
			onClick={() => deleteChannel(currentChannel)}
			className="close-button"
			disabled={!isConnectionOpen}
		>Delete channel</button>
		<button
			aria-label="Edit channel"
			onClick={makeModalVisible}
			className="close-button"
			disabled={!isConnectionOpen}
		>Edit channel</button>
		</>
		)
	}
	return (
		<div>
			<button
				aria-label="Return to channel list"
				onClick={() => setCurrentChannel("")}
				className="close-button"
				disabled={!isConnectionOpen}
			>Return to channel list</button>
			<button
				aria-label="Leave channel"
				onClick={() => leaveChannel(currentChannel)}
				className="close-button"
				disabled={!isConnectionOpen}
			>Leave channel</button>
			{extraoptions}
		</div>
	);
}

function ChatChannel(
	{
		currentChannel, setCurrentChannel, isConnectionOpen, messages, messageBody, sendMessage, setMessageBody, sender, muted, deleteChannel, leaveChannel, role, updateVisibility
	} : {
		currentChannel: string,
		setCurrentChannel: (channel: string) => void,
		isConnectionOpen: boolean,
		messages: UserMessage[] | Message[],
		messageBody: string,
		sendMessage: () => void,
		setMessageBody: (message: string) => void,
		sender: string,
		muted: boolean,
		deleteChannel: (channel: string) => Promise<boolean>,
		leaveChannel: (channel: string) => Promise<boolean>,
		role: string,
		updateVisibility: (channel_id: string, visibility: number, password: string) => Promise<boolean>
	}){
	const modal = useRef<HTMLDialogElement>(null);
	const visibilityForm = useRef<HTMLFormElement>(null);

	const makeModalVisible = () => {
		modal.current?.showModal();
	};

	console.log("hmmm homie", role);
	return (
		<>
		{channelOptions(role, isConnectionOpen, currentChannel, setCurrentChannel, deleteChannel, leaveChannel, makeModalVisible)}
		<div id="chat-history" className="scrollable">
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
				<ChannelEditor
					ref={modal}
					currentChannel={currentChannel}
					create_or_update_channel={updateVisibility}
					defaultvisibility=""
				/>
			</div>
		</footer>
		</>
	);
};

export default ChatChannel;