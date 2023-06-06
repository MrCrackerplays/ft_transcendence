import { Component, Dispatch, ReactNode, SetStateAction, forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Socket, io } from "socket.io-client"
import "./chat.css"
import { type } from "os";

type UserMessage = {
	channel: string;
	content: string;
	sender: string;
	date: string;
}

type Message = {
	channel: string;
	content: string;
}

function isUserMessage(message: UserMessage | Message): message is UserMessage {
	return (message as UserMessage).sender !== undefined;
}

function Chat( {sender} : {sender: string}) {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const [history, setHistory] = useState<Map<string, UserMessage[] | Message[]>>(new Map());
	const [messageBody, setMessageBody] = useState("");
	// const [history, setHistory] = useState<Message[]>([]);
	const [currentChannel, setCurrentChannel] = useState("");

	const magic_channel = "3e809453-5734-482c-aa2a-8fc311f0cd4e";

	const ws = useRef<Socket>();

	const getMessageHistory = (channel_id : string) => {
		return fetch("http://localhost:3000/channels/" + channel_id + "/messages", {
			credentials: 'include'
		});
	};

	const sendMessage = () => {
		console.log("sendmessage")
		if (messageBody?.trim()) {//TODO: change channel_id to be dynamic
			ws.current?.emit("message", {channel: currentChannel, message: messageBody.trim()});
			setMessageBody("");
		}
	};

	const updateHistory = (channel: string, message: UserMessage | Message) => {
		// setHistory(his => new Map(his.set(channel, messages)));
		// console.log("updating history for", channel, "with", message);
		setHistory(
			hist => new Map(hist.set(
				channel,
				(hist.has(channel) ? [message, ...hist.get(channel)!] : [message])
			))
		);
	};

	useEffect(() => {
		let deb = false
		deb = true;
		if (deb)
			setCurrentChannel(magic_channel);
		else
			setCurrentChannel("");
		console.log("subscribed to events?")
		if (!ws.current)
			ws.current = io("http://localhost:3000", {withCredentials: true});
		else if (ws.current.disconnected)
			ws.current.connect();
		// ws.current.emit("create", {channel: "coolerchannel"});
		if (!ws.current.hasListeners("connect")) {
			ws.current.on("connect", () => {
				console.log("Connected to server");
				setIsConnectionOpen(true);
				ws.current?.emit("join", {channel: magic_channel});
				getMessageHistory(magic_channel).then(res => res.json()).then(data => {
					console.log("data", data);
					setHistory(hist => new Map(hist.set(magic_channel, data)));
				});
				console.log("smile")
			});
		}

		if (!ws.current.hasListeners("disconnect")) {
			ws.current.on("disconnect", () => {
				console.log("Disconnected from server");
				setIsConnectionOpen(false);
			});
		}

		if (!ws.current.hasListeners("test")) {
			ws.current.on("test", (message) => {
				console.log("Received test:", message);
			});
		}

		if (!ws.current.hasListeners("message")) {
			ws.current.on("message", (message) => {
				console.log("Received message:", message);
				updateHistory(message.channel, message);
			});
		}

		if (!ws.current.hasListeners("join")) {
			ws.current.on("join", (message) => {
				console.log("Received join:", message);
				updateHistory(message.channel, message);
			});
		}

		// return () => {
		// 	console.log("Cleaning up...");
		// 	ws.current?.close();
		// }
	}, []);

	if (currentChannel) {
		return (
			<>
			<ChatChannel
				isConnectionOpen={isConnectionOpen}
				messages={history.get(currentChannel) || []}
				messageBody={messageBody}
				setMessageBody={setMessageBody}
				sendMessage={sendMessage}
				sender={sender} />
			</>
		)
	}
	else {
		return (
			<>
			<ChannelList
				sender={sender} />
			</>
		)
	}
}

function ChannelList( { sender } ) {
	return (
		<div>you are {sender} </div>
	);
}

function UserMessage({ message, sender } : { message: UserMessage; sender: string }) {
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

function Message({ message } : {message: Message}) {
	return (
		<div className="message join-message">
			<i>
				{message.content}
			</i>
		</div>
	);
}

function ChatChannel( props: { isConnectionOpen: boolean; messages: UserMessage[] | Message[]; messageBody: string; sendMessage: () => void; setMessageBody: (message: string) => void; sender: string; } ) {
	const isConnectionOpen : boolean = props.isConnectionOpen;
	const messages : UserMessage[] | Message[] = props.messages;
	const messageBody : string = props.messageBody;
	const sendMessage : () => void = props.sendMessage;
	const setMessageBody : (message: string) => void = props.setMessageBody;

	return (
		<>
		<div id="chat-history">
			<div id="history-anchor"></div>
			{messages.map((message: UserMessage | Message, index : number) => (
				// message is Message ?
				isUserMessage(message) ?
				<UserMessage key={index} message={message} sender={props.sender}/>
				:
				<Message key={index} message={message} />
			))}
		</div>
		<footer className="chat-area">
			<p style={{margin:0}}>
				You are chatting as Yourself
			</p>
			<div style={{display:"flex"}}>
				<textarea
					id="message-input"
					className="message-box"
					placeholder="Type your message here..."
					value={messageBody}
					onKeyDown={(e) => {
						if (e.key == "Enter" && e.shiftKey == false) {
							e.preventDefault();
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
					disabled={!isConnectionOpen}
				>Send</button>
			</div>
		</footer>
		</>
	);
};

export default Chat;