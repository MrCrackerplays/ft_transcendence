import { Dispatch, SetStateAction, forwardRef, useEffect, useRef, useState } from "react"
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

	const ws = useRef<Socket>();

	const getMessageHistory = (channel_id : string) => {
		return fetch("http://localhost:3000/channels/" + channel_id + "/messages", {
			credentials: 'include'
		});
	};

	const sendMessage = () => {
		console.log("sendmessage")
		if (messageBody) {//TODO: change channel_id to be dynamic
			ws.current?.emit("message", {channel: currentChannel ,message: messageBody});
			setMessageBody("");
		}
	};

	const updateHistory = (channel: string, message: UserMessage | Message) => {
		// setHistory(his => new Map(his.set(channel, messages)));
		// console.log("updating history for", channel, "with", message);
		setHistory(
			hist => new Map(hist.set(
				channel,
				(hist.has(channel) ? [...hist.get(channel)!, message] : [message])
			))
		);
	};

	useEffect(() => {
		let deb = false
		deb = true;
		if (deb)
			setCurrentChannel("f4b0aae2-57d6-4569-b8c2-bfdc83ec535d");
		else
			setCurrentChannel("");
		console.log("subscribed to events?")
		if (!ws.current)
			ws.current = io("http://localhost:3000", {withCredentials: true});

		if (!ws.current.hasListeners("connect")) {
			ws.current.on("connect", () => {
				console.log("Connected to server");
				setIsConnectionOpen(true);
				ws.current?.emit("join", {channel: "f4b0aae2-57d6-4569-b8c2-bfdc83ec535d"});
				getMessageHistory("f4b0aae2-57d6-4569-b8c2-bfdc83ec535d").then(res => res.json()).then(data => {
					console.log("data", data);
					// setHistory(hist => new Map(hist.set("f4b0aae2-57d6-4569-b8c2-bfdc83ec535d", data)));
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
	)
}

function UserMessage({ message, index, sender } : { message: UserMessage; index: number; sender: string }) {
	let alignment = "leftalign"
	let message_top = (
	<div style={{display:"flex", justifyContent:"space-between"}}>
		<div style={{textAlign:"left"}}>
			{message.sender}
		</div>
		<sub style={{textAlign:"right"}}>
			{new Date(message.date).toLocaleString()}
		</sub>
	</div>);

	if (message.sender == sender) {
		alignment = "rightalign";
		message_top = (
		<div style={{display:"flex", justifyContent:"space-between"}}>
			<sub style={{textAlign:"left"}}>
				{new Date(message.date).toLocaleString()}
			</sub>
			<div style={{textAlign:"right"}}>
				{message.sender}
			</div>
		</div>)
	}

	return (
		<div className={`message ${alignment}`} key={index}>
			{message_top}
			<div>
				{message.content}
			</div>
		</div>
	);
}
function Message({ message, index} : {message: Message, index: number}) {
	
	return (
		<div className={`message join-message`} key={index}>
			<p><i>
				{message.content}
			</i></p>
		</div>
	);
}

function ChatChannel( props: { isConnectionOpen: boolean; messages: UserMessage[] | Message[]; messageBody: string; sendMessage: () => void; setMessageBody: Dispatch<SetStateAction<string>>; sender: string } ) {
	const isConnectionOpen : boolean = props.isConnectionOpen;
	const messages : UserMessage[] | Message[] = props.messages;
	const messageBody : string = props.messageBody;
	const sendMessage : () => void = props.sendMessage;
	const setMessageBody : React.Dispatch<React.SetStateAction<string>>	= props.setMessageBody;
	return (
		<>
		<div className="history">
			{messages.map((message: UserMessage | Message, index : number) => (
				// message is Message ?
				isUserMessage(message) ?
				<UserMessage key={index} message={message} index={index} sender={props.sender}/>
				:
				<Message key={index} message={message} index={index} />
			))}
		</div>
		<footer className="chat-area">
			<p>
				You are chatting as Yourself
			</p>
			<div>
				<input
					id="message-input"
					type="text"
					className="message-box"
					placeholder="Type your message here..."
					value={messageBody}
					onChange={(e) => setMessageBody(e.target.value)}
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