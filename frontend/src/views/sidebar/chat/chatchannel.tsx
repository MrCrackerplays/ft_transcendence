import { useEffect, useRef, useState } from "react";
import { Message, UserMessage, isUserMessage, MenuItem } from "./messagetypes";
import ChannelEditor from "./channeleditor";
import { useNavigate } from "react-router-dom";
import { Constants } from "../../../../../shared/constants";

type menuSettings = { x: number, y: number, boundX: number, boundY: number, show: boolean, target: string };

type role = "owner" | "admin" | "user";

function UserMenuComponent({ channel, menusettings, setMenu, items }: { channel: string, menusettings: menuSettings, setMenu: (menusettings: menuSettings) => void, items: MenuItem[] }): JSX.Element {
	const menuref = useRef<HTMLMenuElement>(null);

	const ownBounds = [menuref.current?.offsetWidth || 0, menuref.current?.offsetHeight || 0];
	const bufferspace = 20
	const maxwidth = menusettings.boundX - ownBounds[0] - bufferspace;
	const maxheight = menusettings.boundY - ownBounds[1] - bufferspace;
	let x = menusettings.x;
	let y = menusettings.y;
	if (x < bufferspace)
		x = bufferspace;
	if (x > maxwidth)
		x = maxwidth;
	if (y < bufferspace)
		y = bufferspace;
	if (y > maxheight)
		y = maxheight;

	menuref.current?.style.setProperty("left", `${x}px`);
	menuref.current?.style.setProperty("top", `${y}px`);

	useEffect(() => {
		function handleClickOutside(event) {
			if (menuref.current && !menuref.current.contains(event.target)) {
				setMenu({ x: 0, y: 0, boundX: 0, boundY: 0, show: false, target: "" });
			}
		}
		// Bind the event listener
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuref]);

	return (
		<menu ref={menuref} style={{ width: "100px" }} className={"chat-user-menu" + (!menusettings.show ? " hide" : "")}>
			{items.map((item, i) => {
				return (
					<button
						key={i}
						className="testmenu-item"
						onClick={() => {
							if (item.label == "Invite to game" || item.label == "Block" || item.label == "Unblock")
								item.action(menusettings.target);
							else
								item.action({ channel: channel, user: menusettings.target });
							setMenu({ x: 0, y: 0, boundX: 0, boundY: 0, show: false, target: "" });
						}}
					>
						{item.label}
					</button>
				);
			})}
		</menu>
	);
}


function UserMessageComponent({ message, sender, setMenu, blocked }: { message: UserMessage; sender: string, setMenu: (menusettings: menuSettings) => void, blocked: string[] }): JSX.Element {
	const navigate = useNavigate();
	let alignment = "leftalign";
	let sender_element = <div className="message-sender"
		onClick={() => {
			navigate(`/profile/${message.sender}`);
		}}
		onContextMenu={(e) => {
			e.preventDefault();
			if (e.ctrlKey) {
				navigator.clipboard.writeText(message.sender_id);
				return;
			}
			/*
				chatbox <-what we want to get the bounds from
					chat-history
						message
							message-header
								div tag(<div>) <- what currentTarget is
			*/
			if (!e.currentTarget.parentElement?.parentElement?.parentElement?.parentElement)
				return;
			let bounds = e.currentTarget.parentElement.parentElement.parentElement.parentElement.getBoundingClientRect();
			//makes the click x and y coordinates relative to the chatbox
			setMenu({ x: e.clientX - bounds.left, y: e.clientY - bounds.top, boundX: bounds.width, boundY: bounds.height, show: true, target: message.sender_id });
		}}
	>{message.sender}</div>;
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
				{blocked.includes(message.sender_id) ? <i>{"<blocked message>"}</i> : message.content}
			</div>
		</div>
	);
}

function MessageComponent({ message }: { message: Message }): JSX.Element {
	if (message.content.endsWith(":GAMEINVITE")) {
		const navigate = useNavigate();
		const inviteid = message.content.slice(0, -11);
		return (
			<div className="message invite-message">
				<button onClick={() => {
					navigate("/private/" + inviteid);
				}}>
					Join Game Invite
				</button>
			</div>
		);
	}
	return (
		<div className="message generic-message">
			<i>
				{message.content}
			</i>
		</div>
	);
}

function channelOptions(role: role, isConnectionOpen: boolean, currentChannel: string, setCurrentChannel: (channel: string) => void, deleteChannel: (channel: string) => Promise<boolean>, leaveChannel: (channel: string) => Promise<boolean>, makeModalVisible: () => void): JSX.Element {
	const [showLink, setShowLink] = useState(false);
	let link = <></>;
	const linkurl = Constants.BACKEND_URL + "/chat-invite/" + currentChannel;
	if (showLink)
		link =  <a className="channel-invite" href={linkurl}>{linkurl}</a>;
	let extraoptions = <></>;
	if (role == "owner") {
		extraoptions = (
			<>
				<button
					aria-label="Delete channel"
					onClick={() => {
						if (prompt("Are you sure you want to delete the channel? Type DELETE to confirm.") === "DELETE")
							deleteChannel(currentChannel);
					}}
					className="chat-button"
					disabled={!isConnectionOpen}
				>Delete channel</button>
				<button
					aria-label="Edit channel"
					onClick={makeModalVisible}
					className="chat-button"
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
				className="chat-button"
				disabled={!isConnectionOpen}
			>Return to channel list</button>
			<button
				aria-label="Leave channel"
				onClick={() => leaveChannel(currentChannel)}
				className="chat-button"
				disabled={!isConnectionOpen}
			>Leave channel</button>
			{/* get currentChannel to clipboard */}
			<button
				aria-label="Get channel link"
				onClick={() => setShowLink(!showLink)}
				className="chat-button"
				disabled={!isConnectionOpen}
			>Get channel invite</button>{link}
			{extraoptions}
		</div>
	);
}

function ChatChannel(
	{
		currentChannel, setCurrentChannel, isConnectionOpen, messages, messageBody, sendMessage, setMessageBody, sender, muted, deleteChannel, leaveChannel, role, updateVisibility, getItems, blocked
	}: {
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
		role: role,
		updateVisibility: (channel_id: string, visibility: number, password: string) => Promise<boolean>,
		getItems: (role: string) => MenuItem[],
		blocked: string[]
	}) {
	const modal = useRef<HTMLDialogElement>(null);

	const [menu, setMenu] = useState<menuSettings>({ x: 0, y: 0, boundX: 0, boundY: 0, show: false, target: "" });


	const makeModalVisible = () => {
		modal.current?.showModal();
	};

	return (
		<>
			{channelOptions(role, isConnectionOpen, currentChannel, setCurrentChannel, deleteChannel, leaveChannel, makeModalVisible)}
			<div id="chat-history" className="scrollable">
				<div id="history-anchor"></div>
				{messages.map((message: UserMessage | Message, index: number) => (
					isUserMessage(message) ?
						<UserMessageComponent key={index} message={message} sender={sender} setMenu={setMenu} blocked={blocked} />
						:
						<MessageComponent key={index} message={message} />
				))}
			</div>
			<UserMenuComponent channel={currentChannel} menusettings={menu} setMenu={setMenu} items={getItems(role)} />
			<footer className="chat-area">
				<div>
					You are chatting as {sender}
				</div>
				<div style={{ display: "flex" }}>
					<textarea
						id="message-input"
						className="message-box"
						placeholder={muted? "You have been muted..." : "Type your message here..."}
						value={messageBody}
						onKeyDown={(e) => {
							if (e.key == "Enter" && e.shiftKey == false) {
								e.preventDefault();
								if (isConnectionOpen)
									sendMessage();
							}
						}}
						onChange={(e) => { setMessageBody(e.target.value) }}
						autoComplete="off"
						disabled={muted}
						required
					/>
					<button
						aria-label="Send"
						onClick={sendMessage}
						className="send-button"
						disabled={!isConnectionOpen || muted}
					>{muted ? "Muted" : "Send"}</button>
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