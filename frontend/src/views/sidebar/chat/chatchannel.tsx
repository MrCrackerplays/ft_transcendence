import { forwardRef, useEffect, useRef, useState } from "react";
import { Message, UserMessage, isUserMessage } from "./messagetypes";
import ChannelEditor from "./channeleditor";
// import { Menu, Transition } from "@headlessui/react";

const links = [
	{ action: 'kick', label: 'Kick' },
	{ action: 'ban', label: 'Ban' },
	{ action: 'mute', label: 'Mute' },
	{ action: 'unmute', label: 'Unmute' },
	{ action: 'promote', label: 'Promote' },
	{ action: 'demote', label: 'Demote' },
	{ action: 'unban', label: 'Unban' }
]

// function Testmenu() : ReactElement {
// 	return (
// 	);
// }

// const ChatUserComponent = forwardRef<HTMLElement, {showmenu: boolean, setshowmenu: (show: boolean) => void}>(({showmenu, setshowmenu}, ref) => {
// 	if (!ref)
// 		return <></>;
// 	return (//TODO: MAKE THIS MENU WORK WITH RIGHT CLICKING PROBABLY BY NOT USING HEADLESSUI AS IT SUCKS BALLS BUT BY MAKING A CUSTOM MENU
// 		<Transition
// 			appear={false}
// 			show={showmenu}
// 			as={Fragment}
// 		>
// 			<Menu ref={ref}>
// 				<Menu.Items className="chat-user-menu" static>
// 				{
// 					links.map((link) => (
// 						<Menu.Item>
// 						<button
// 							key={link.action}
// 							className="testmenu-item"
// 							onClick={() => {
// 								console.log(link.action);
// 								setshowmenu(false);
// 							}}
// 						>
// 							{link.label}
// 						</button>
// 						</Menu.Item>
// 					))
// 				}
// 				</Menu.Items>
// 			</Menu>
// 		</Transition>
// 	);
// });

function UserMenuComponent({ x, y, show, setMenu } : { x: number, y: number, show: boolean, setMenu: ({x, y, show}: {x: number, y: number, show: boolean}) => void}) : JSX.Element {
	const menuref = useRef<HTMLMenuElement>(null);
	// window.innerWidth, window.innerHeight
	// const scroperef = useRef([window.innerWidth, window.innerHeight]);

	const [bounds, setBounds] = useState([0, 0]);
	useEffect(() => {
		setBounds([menuref.current?.offsetWidth || 0, menuref.current?.offsetHeight || 0]);
	}, []);

	const maxwidth = window.innerWidth - bounds[0];
	const maxheight = window.innerHeight - bounds[1];
	console.log(x, window.innerWidth, bounds[0], maxwidth)
	if (x > maxwidth)
		x = maxwidth;
	console.log(y, window.innerHeight, bounds[1], maxheight)
	if (y > maxheight)
		y = maxheight;

	useEffect(() => {
		function handleClickOutside(event) {
			if (menuref.current && !menuref.current.contains(event.target)) {
				setMenu({x: 0, y: 0, show: false});
			}
		}
		// Bind the event listener
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
		// Unbind the event listener on clean up
		document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuref]);


	if (!show)
		return (<></>);
	return (
	<menu ref={menuref} style={{left: `${x}px`, top: `${y}px`, width:"100px"}} className="chat-user-menu">
		hello there
	</menu>
	);
}

function UserMessageComponent({ message, sender, setMenu } : { message: UserMessage; sender: string, setMenu: ({x, y, show}: {x: number, y: number, show: boolean}) => void}) : JSX.Element {
	let alignment = "leftalign";
	let sender_element = <a href={`/profile/${message.sender}`}
			onContextMenu={(e) => {
				e.preventDefault();
				console.log(e);
				if (!e.currentTarget.parentElement?.parentElement?.parentElement?.parentElement)
					return;
				let bounds = e.currentTarget.parentElement?.parentElement?.parentElement?.parentElement.getBoundingClientRect();
				console.log(bounds);//TODO:STUPID ASS STORM FORCING US HOME
				setMenu({x: e.clientX - bounds.left, y: e.clientY - bounds.top, show: true});
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

	const [menu, setMenu] = useState({x: 0, y: 0, show: false});


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
				<UserMessageComponent key={index} message={message} sender={sender} setMenu={setMenu} />
				:
				<MessageComponent key={index} message={message} />
			))}
		</div>
		<UserMenuComponent x={menu.x} y={menu.y} show={menu.show} setMenu={setMenu} />
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