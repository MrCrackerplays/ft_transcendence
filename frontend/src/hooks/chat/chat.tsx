import { useEffect, useRef, useState } from "react"
import { Socket, io } from "socket.io-client"
import "./chat.css"
import { Message, UserMessage, isUserMessage } from "./messagetypes";
import ChannelList from "./channellist";
import ChatChannel from "./chatchannel";

function block_filter(message: UserMessage | Message) : UserMessage | Message {
	if (isUserMessage(message)) {
		let should_block = false;
		//TODO: implement block check once added to the User entity
		// should_block = true;
		if (should_block)
			message.content = "<blocked message>";
	}
	return message;
}

function Chat( {sender} : {sender: string}) {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const [history, setHistory] = useState<Map<string, UserMessage[] | Message[]>>(new Map());
	const [messageBody, setMessageBody] = useState("");
	const [channels, setChannels] = useState<string[]>([]);
	const [currentChannel, setCurrentChannel] = useState("");

	const magic_channel = "3e809453-5734-482c-aa2a-8fc311f0cd4e";

	const ws = useRef<Socket>();

	const getMessageHistory = (channel_id : string) => {
		return fetch("http://localhost:3000/self/channels/" + channel_id + "/messages", {
			credentials: 'include'
		});
	};

	const sendMessage = () => {
		console.log("sendmessage")
		// ws.current?.emit("create", {channel: "another-channel"});
		if (messageBody?.trim()) {
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
				(hist.has(channel) ? [block_filter(message), ...hist.get(channel)!] : [block_filter(message)])
			))
		);
	};

	useEffect(() => {
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
				getMessageHistory(magic_channel).then(res => res.json()).then((data) => {//TODO: get history upon first joining a channel
					console.log("data", data);
					data = data.map((message) => {
						let formatted_message = {
							channel: message.channel.id,
							content: message.content,
							sender: message.author.userName,
							date: message.date
						};
						return (block_filter(formatted_message));
					});
					setHistory(hist => new Map(hist.set(magic_channel, data)));
				});
				fetch("http://localhost:3000/channels/", {credentials: 'include'}).then(res => res.json()).then((data) => {
					data = data.map((channel) => {
						return channel.id;
					});
					setChannels(data);
					console.log("channels", data);
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
			<button
				aria-label="Return to channel list"
				onClick={() => setCurrentChannel("")}
				className="close-button"
				disabled={!isConnectionOpen}
			>Return to channel list</button>
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
				sender={sender}
				setCurrentChannel={setCurrentChannel}
				isConnectionOpen={isConnectionOpen}
				channels={channels}
				setChannels={setChannels} />
			</>
		)
	}
}

export default Chat;