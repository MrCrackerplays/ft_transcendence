import { useEffect, useRef, useState } from "react";
import { Message, UserMessage, isUserMessage, MenuItem } from "./messagetypes";
import ChannelEditor from "./channeleditor";
import { Constants } from "../../../../../shared/constants";

type menuSettings = {x: number, y: number, boundX: number, boundY: number, show: boolean, target: string};

type role = "owner" | "admin" | "user";

function UserMenuComponent({ channel, menusettings, setMenu, items } : { channel: string, menusettings: menuSettings, setMenu: (menusettings: menuSettings) => void, items: MenuItem[]}) : JSX.Element {
	const menuref = useRef<HTMLMenuElement>(null);

	const ownBounds = [menuref.current?.offsetWidth || 0, menuref.current?.offsetHeight || 0];
	const bufferspace= 20
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
				setMenu({x: 0, y: 0, boundX: 0, boundY: 0, show: false, target: ""});
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
		<menu ref={menuref} style={{width:"100px"}} className={"chat-user-menu" + (!menusettings.show ? " hide" : "")}>
			{items.map((item, i) => {
				return (
					<button
						key={i}
						className="testmenu-item"
						onClick={() => {
							console.log(item.label);
							if (item.label == "Invite to game" || item.label == "Block" || item.label == "Unblock")
								item.action(menusettings.target);
							else
								item.action({channel: channel, user: menusettings.target});
							setMenu({x: 0, y: 0, boundX: 0, boundY: 0, show: false, target: ""});
						}}
					>
						{item.label}
					</button>
				);
			})}
		</menu>
	);
}


function UserMessageComponent({ message, sender, setMenu } : { message: UserMessage; sender: string, setMenu: (menusettings: menuSettings) => void}) : JSX.Element {
	let alignment = "leftalign";
	let sender_element = <a href={`/profile/${message.sender}`}
			onContextMenu={(e) => {
				e.preventDefault();
				console.log(e);
				/*
					chatbox <-what we want to get the bounds from
						chat-history
							message
								message-header
									anchor tag(<a>) <- what currentTarget is
				*/
				if (!e.currentTarget.parentElement?.parentElement?.parentElement?.parentElement)
					return;
				let bounds = e.currentTarget.parentElement.parentElement.parentElement.parentElement.getBoundingClientRect();
				//makes the click x and y coordinates relative to the chatbox
				setMenu({x: e.clientX - bounds.left, y: e.clientY - bounds.top, boundX: bounds.width, boundY: bounds.height, show: true, target: message.sender});
			}}
		>{message.sender}</a>;
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

function channelOptions(role: role, isConnectionOpen: boolean, currentChannel: string, setCurrentChannel: (channel: string) => void, deleteChannel: (channel: string) => Promise<boolean>, leaveChannel: (channel: string) => Promise<boolean>, makeModalVisible: () => void) : JSX.Element {
	let extraoptions = <></>;
	if (role == "owner" || role == "admin") {
		extraoptions = (
		<>
		<button
			aria-label="Delete channel"
			onClick={() => deleteChannel(currentChannel)}
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
			{/* copy currentChannel to clipboard */}
			<button
				aria-label="Copy channel link"
				onClick={() => navigator.clipboard.writeText(`${Constants.BACKEND_URL}/chat-invite/${currentChannel}`)}
				className="chat-button"
				disabled={!isConnectionOpen}
			>Copy channel invite</button>
			{extraoptions}
		</div>
	);
}

function ChatChannel(
	{
		currentChannel, setCurrentChannel, isConnectionOpen, messages, messageBody, sendMessage, setMessageBody, sender, muted, deleteChannel, leaveChannel, role, updateVisibility, getItems
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
		role: role,
		updateVisibility: (channel_id: string, visibility: number, password: string) => Promise<boolean>,
		getItems: (role: string) => MenuItem[]
	}){
	const modal = useRef<HTMLDialogElement>(null);

	const [menu, setMenu] = useState<menuSettings>({x: 0, y: 0, boundX: 0, boundY: 0, show: false, target: ""});


	const makeModalVisible = () => {
		modal.current?.showModal();
	};

	return (
		<>
		{channelOptions(role, isConnectionOpen, currentChannel, setCurrentChannel, deleteChannel, leaveChannel, makeModalVisible)}
		<div id="chat-history" className="scrollable">
			<div id="history-anchor"></div>
			{messages.map((message: UserMessage | Message, index : number) => (
				isUserMessage(message) ?
				<UserMessageComponent key={index} message={message} sender={sender} setMenu={setMenu} />
				:
				<MessageComponent key={index} message={message} />
			))}
		</div>
		<UserMenuComponent channel={currentChannel} menusettings={menu} setMenu={setMenu} items={getItems(role)} />
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