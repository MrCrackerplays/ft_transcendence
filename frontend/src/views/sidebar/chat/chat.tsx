import { useEffect, useRef, useState } from "react"
import { Socket, io } from "socket.io-client"
import "./chat.css"
import { Message, UserMessage, isUserMessage, MenuItem } from "./messagetypes";
import ChannelList from "./channellist";
import ChatChannel from "./chatchannel";
import { Channel } from "./channeltypes";
import { useStateRef } from "./usestateref";
import { Constants } from "../../../../../shared/constants";

function Chat( {
		sender, sender_id, setStartDM
	} : {
		sender: string,
		sender_id: string,
		setStartDM: (value: React.SetStateAction<(id: string) => void>) => void
	}
	) {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const [history, setHistory] = useState<Map<string, UserMessage[] | Message[]>>(new Map());
	const [messageBody, setMessageBody] = useState("");
	const [channels, setChannels] = useState<Channel[]>([]);
	const [muted, setMuted] = useState<string[]>([]);
	const [banned, setBanned] = useState<string[]>([]);
	const [owner, setOwner] = useState<string[]>([]);
	const [admin, setAdmin] = useState<string[]>([]);
	const [blocked, setBlocked] = useState<string[]>([]);
	const [hasloaded, setHasLoaded] = useState(false);

	const [joinedChannels, setJoinedChannels, joinedChannelsRef] = useStateRef<string[]>([]);
	const [currentChannel, setCurrentChannel, currentChannelRef] = useStateRef<string>("");

	const ws = useRef<Socket>();

	const hasJoined = (channel_id: string) => {
		return joinedChannels.includes(channel_id);
	}

	// const block_filter = (message: UserMessage | Message): UserMessage | Message => {
	// 	if (isUserMessage(message)) {
	// 		const should_block = blocked.includes(message.sender_id);
	// 		console.log("should block: " + should_block + " " + message.sender_id + " " + message.sender, blocked)
	// 		if (should_block)
	// 			message.content = "<blocked message>";
	// 	}
	// 	return message;
	// }

	const getMessageHistory = (channel_id: string) => {
		return fetch(`${Constants.BACKEND_URL}/self/channels/` + channel_id + "/messages", {
			credentials: 'include'
		});
	};

	const refreshBlocked = () => {
		ws.current?.emit("get_blocked");
	};

	const createChannel = (name: string, visibility: number, password: string) => {
		return new Promise<boolean>((resolve, reject) => {
			ws.current?.emit("create", { name: name, visibility: visibility, password: password }, (response: boolean) => {
				resolve(response);
			});
		});
	};

	const updateVisibility = (channel_id: string, visibility: number, password: string) => {
		return new Promise<boolean>((resolve, reject) => {
			ws.current?.emit("updateChannel", { channel: channel_id, visibility: visibility, password: password }, (response: boolean) => {
				resolve(response);
			});
		});
	};

	const deleteChannel = (channel_id: string) => {
		return new Promise<boolean>((resolve, reject) => {
			ws.current?.emit("delete", { channel: channel_id }, (response: boolean) => {
				resolve(response);
			});
		});
	};

	const leaveChannel = (channel_id: string) => {
		return new Promise<boolean>((resolve, reject) => {
			ws.current?.emit("leave", { channel: channel_id }, (response: boolean) => {
				resolve(response);
			});
		});
	};

	const joinResponse = ({ channel_id, success, reason }: { channel_id: string, success: boolean, reason: string }) => {
		if (!success) {
			console.log("join failed", reason);
			if (reason === "not subscribed" && joinedChannels.includes(channel_id)) {
				setJoinedChannels(joined => joined.filter((channel) => channel !== channel_id));
			}
			if (reason === "banned") {
				setBanned(banned => [...banned, channel_id]);
			}
			return;
		}
		setCurrentChannel(channel_id);
		getMessageHistory(channel_id).then(res => res.json()).then((data) => {
			data = data.map((message) => {
				let formatted_message = {
					channel: message.channel.id,
					content: message.content,
					sender: message.author ? message.author.userName : "null",
					sender_id: message.author ? message.author.id : "null",
					date: message.date
				};
				return (formatted_message);
				// return (block_filter(formatted_message));
			});
			setHistory(hist => new Map(hist.set(channel_id, data)));
		});
		setJoinedChannels(joined => [...joined, channel_id]);
	};

	const joinChannel = (channel_id: string, password: string | null = null) => {
		if (banned.includes(channel_id)) {
			console.log("you are banned from this channel");
			return;
		}
		if (joinedChannels.includes(channel_id)) {
			setCurrentChannel(channel_id);
			return;
		}
		ws.current?.emit("subscribe", { channel: channel_id, password: password }, (response: boolean) => {
			console.log("emitting join");
			ws.current?.emit("join", { channel: channel_id }, joinResponse);
		});
	};

	const sendMessage = () => {

		if (messageBody.startsWith("/")) {
			let message: string[] = messageBody.split(" ");
			if (message.length == 1) {
				if (message[0] == "/leave") {
					ws.current?.emit("leave", {channel: currentChannel});
					return;
				}
			}
			if (message.length == 2) {
				if (message[0] == "/ban") {
					ws.current?.emit("ban", {channel: currentChannel, user: message[1]});
					return;
				}
				if (message[0] == "/unban") {
					ws.current?.emit("unban", {channel: currentChannel, user: message[1]});
					return;
				}
				if (message[0] == "/mute") {
					ws.current?.emit("mute", {channel: currentChannel, user: message[1]});
					return;
				}
				if (message[0] == "/unmute") {
					ws.current?.emit("unmute", {channel: currentChannel, user: message[1]});
					return;
				}
				if (message[0] == "/kick") {
					ws.current?.emit("kick", {channel: currentChannel, user: message[1]});
					return;
				}
			}
		}

		if (muted.includes(currentChannel)) {
			console.log("you are muted");
			return;
		}
		console.log("sendmessage")
		// ws.current?.emit("create", {channel: "another-channel"});
		if (messageBody?.trim()) {
			ws.current?.emit("message", { channel: currentChannel, message: messageBody.trim() });
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
				// (hist.has(channel) ? [block_filter(message), ...hist.get(channel)!] : [block_filter(message)])
			))
		);
	};

	function openDMChannel(id:string) {
		ws.current?.emit("start_dm", {user: id}, (response: string) => {
			console.log("start dm response", response);
			if (response !== "") {
				setCurrentChannel(response);
				setJoinedChannels(joined => [...joined, response]);
			}
		});
	}

	useEffect(() => {
		setStartDM(()=>openDMChannel);
		console.log("subscribed to events?")
		if (!ws.current)
			ws.current = io(`${Constants.BACKEND_URL}/chat`, { withCredentials: true });
		else if (ws.current.disconnected)
			ws.current.connect();
		// ws.current.emit("create", {channel: "coolerchannel"});
		if (!ws.current.hasListeners("connect")) {
			ws.current.on("connect", () => {
				console.log("Connected to server");
				setIsConnectionOpen(true);
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
			ws.current.on("join", (channel: string) => {
				getMessageHistory(channel).then(res => res.json()).then((data) => {
					data = data.map((message) => {
						let formatted_message = {
							channel: message.channel.id,
							content: message.content,
							sender: message.author ? message.author.userName : "null",
							sender_id: message.author ? message.author.id : "null",
							date: message.date
						};
						return (formatted_message);
						// return (block_filter(formatted_message));
					});
					setHistory(hist => new Map(hist.set(channel, data)));
				});
				setJoinedChannels(joined => [...joined, channel]);
			});
		}

		if (!ws.current.hasListeners("leave")) {
			ws.current.on("leave", (channel: string) => {
				console.log("Received leave from:", channel);
				if (currentChannelRef.current === channel)
					setCurrentChannel("");
				if (joinedChannelsRef.current.includes(channel))
					setJoinedChannels(joined => joined.filter((id) => id !== channel));
				if (history.has(channel))
					setHistory(hist => {
						hist.delete(channel);
						return hist;
					});
				console.log("finished leaving");
			});
		}

		if (!ws.current.hasListeners("kick")) {
			ws.current.on("kick", (channel: string) => {
				console.log("Received kick from:", channel);
				if (currentChannelRef.current === channel)
					setCurrentChannel("");
				if (joinedChannelsRef.current.includes(channel))
					setJoinedChannels(joined => joined.filter((id) => id !== channel));
				if (history.has(channel))
					setHistory(hist => {
						hist.delete(channel);
						return hist;
					});
				console.log("finished getting kicked");
			});
		}

		if (!ws.current.hasListeners("ban")) {
			ws.current.on("ban", (channel) => {
				console.log("Received ban from:", channel);
				if (currentChannelRef.current === channel)
					setCurrentChannel("");
				if (joinedChannelsRef.current.includes(channel))
					setJoinedChannels(joined => joined.filter((id) => id !== channel));
				if (history.has(channel))
					setHistory(hist => {
						hist.delete(channel);
						return hist;
					});
				setBanned(banned => [...banned, channel]);
				console.log("finished getting banned");
			});
		}

		if (!ws.current.hasListeners("unban")) {
			ws.current.on("unban", (channel) => {
				console.log("Received unban from:", channel);
				setBanned(banned => banned.filter((id) => id !== channel));
				console.log("finished getting unbanned");
			});
		}

		if (!ws.current.hasListeners("mute")) {
			ws.current.on("mute", (channel) => {
				console.log("Received mute from:", channel);
				setMuted(muted => [...muted, channel]);
				console.log("finished getting muted");
			});
		}

		if (!ws.current.hasListeners("unmute")) {
			ws.current.on("unmute", (channel) => {
				console.log("Received unmute from:", channel);
				setMuted(muted => muted.filter((id) => id !== channel));
				console.log("finished getting unmuted");
			});
		}

		if (!ws.current.hasListeners("promote")) {
			ws.current.on("promote", (channel) => {
				console.log("Received promote from:", channel);
				setAdmin(admins => [...admins, channel]);
				console.log("finished getting promoted");
			});
		}

		if (!ws.current.hasListeners("demote")) {
			ws.current.on("demote", (channel) => {
				console.log("Received demote from:", channel);
				setAdmin(admins => admins.filter((id) => id !== channel));
				console.log("finished getting demoted");
			});
		}

		if (!ws.current.hasListeners("total_blocked")) {
			ws.current.on("total_blocked", (blocked_users) => {
				console.log("Received total_blocked", blocked_users);
				setBlocked(blocked_users);
				console.log("finished blocking user");
			});
		}

		if (!ws.current.hasListeners("block")) {
			ws.current.on("block", (user_id) => {
				console.log("Received block for:", user_id);
				setBlocked(blocked => [...blocked, user_id]);
				console.log("finished blocking user");
			});
		}

		if (!ws.current.hasListeners("unblock")) {
			ws.current.on("unblock", (user_id) => {
				console.log("Received unblock for:", user_id);
				setBlocked(blocked => blocked.filter((id) => id !== user_id));
				console.log("finished unblocking user");
			});
		}

		return () => {
			console.log("Cleaning up...");
			ws.current?.close();
		}
	}, []);

	const getItems = (role: string): MenuItem[] => {
		let items: MenuItem[] = [];
		switch (role) {
			case "owner":
				items = items.concat([
					{
						label: 'Demote', action: ({ channel, user }: {
							channel: string,
							user: string
						}) => {
							ws.current?.emit("demote", { channel: channel, user: user });
						}
					},
					{
						label: 'Promote', action: ({ channel, user }: {
							channel: string,
							user: string
						}) => {
							ws.current?.emit("promote", { channel: channel, user: user });
						}
					},
				]);
			case "admin":
				items = items.concat([
					{
						label: 'Unban', action: ({ channel, user }: {
							channel: string,
							user: string
						}) => {
							ws.current?.emit("unban", { channel: channel, user: user });
						}
					},
					{
						label: 'Ban', action: ({ channel, user }: {
							channel: string,
							user: string
						}) => {
							ws.current?.emit("ban", { channel: channel, user: user });
						}
					},
					{
						label: 'Unmute', action: ({ channel, user }: {
							channel: string,
							user: string
						}) => {
							ws.current?.emit("unmute", { channel: channel, user: user });
						}
					},
					{
						label: 'Mute', action: ({ channel, user }: {
							channel: string,
							user: string
						}) => {
							ws.current?.emit("mute", { channel: channel, user: user });
						}
					},
					{
						label: 'Kick', action: ({ channel, user }: {
							channel: string,
							user: string
						}) => {
							ws.current?.emit("kick", { channel: channel, user: user });
						}
					},
				]);
			case "user":
				items = items.concat([
					{
						label: 'Unblock', action: (user: string) => {
							ws.current?.emit("unblock", { user: user });
						}
					},
					{
						label: 'Block', action: (user: string) => {
							ws.current?.emit("block", { user: user });
						}
					},
					{
						label: 'Invite to game', action: (user: string) => {
							alert("beep boop you totally invited that person yup totally");
							//TODO: invite to game idk how to yet, depends on game implementation
						}
					},
				]);
		}
		items.reverse();
		return items;
	}

	if (currentChannel) {
		return (
			<div className="chatbox">
				<ChatChannel
					currentChannel={currentChannel}
					setCurrentChannel={setCurrentChannel}
					isConnectionOpen={isConnectionOpen}
					messages={history.get(currentChannel) || []}
					messageBody={messageBody}
					setMessageBody={setMessageBody}
					sendMessage={sendMessage}
					sender={sender}
					muted={muted.includes(currentChannel)}
					deleteChannel={deleteChannel}
					leaveChannel={leaveChannel}
					role={owner.includes(currentChannel) ? "owner" : (admin.includes(currentChannel) ? "admin" : "user")}
					updateVisibility={updateVisibility}
					getItems={getItems}
					blocked={blocked}
				/>
			</div>
		)
	}
	else {
		return (
			<div className="chatbox">
				<ChannelList
					sender={sender}
					sender_id={sender_id}
					joinChannel={joinChannel}
					createChannel={createChannel}
					isConnectionOpen={isConnectionOpen}
					channels={channels}
					setChannels={setChannels}
					banned={banned}
					setOwner={setOwner}
					setAdmin={setAdmin}
					hasloaded={hasloaded}
					setHasLoaded={setHasLoaded}
					hasJoined={hasJoined}
					refreshBlocked={refreshBlocked}
				/>
			</div>
		)
	}
}

export default Chat;