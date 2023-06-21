import { useEffect, useRef } from "react";
import { Channel } from "./channeltypes";
import ChannelEditor from "./channeleditor";

function ChannelList(
	{
		sender, sender_id, joinChannel, createChannel, isConnectionOpen, channels, setChannels, banned, setOwner, setAdmin, hasloaded, setHasLoaded
	} : {
		sender: string,
		sender_id: string,
		joinChannel: (channel_id: string) => void,
		createChannel: (channel_name: string,
		visibility: number,
		password: string) => Promise<boolean>,
		isConnectionOpen: boolean,
		channels: Channel[],
		setChannels: (value: React.SetStateAction<Channel[]>) => void,
		banned: string[],
		setOwner: (value: React.SetStateAction<string[]>) => void,
		setAdmin: (value: React.SetStateAction<string[]>) => void,
		hasloaded: boolean,
		setHasLoaded: (value: boolean) => void
	} ) {
	const modal = useRef<HTMLDialogElement>(null);

	const magic_channel = "3e809453-5734-482c-aa2a-8fc311f0cd4e";

	const refreshChannels = () => {
		let joinedchannels = fetch("http://localhost:3000/self/channels/", {credentials: 'include'}).then(res => res.json());
		let publicchannels = fetch("http://localhost:3000/channels", {credentials: 'include'}).then(res => res.json());

		let owner: Set<string> = new Set();
		let admin: Set<string> = new Set();
		let combineddata: Channel[] = [];
		const adder = (dataholder : Channel[], channel) => {
			if (channel.owner && channel.owner.id === sender_id) {
				owner.add(channel.id);
			}
			if (channel.admins) {
				for (let i = 0; i < channel.admins.length; i++) {
					if (channel.admins[i].id === sender_id) {
						admin.add(channel.id);
						break;
					}
				}
			}
			dataholder.push({id: channel.id, name: channel.name, visibility: channel.visibility, password: channel.password});
		}
		Promise.all([joinedchannels, publicchannels]).then((data) => {
			console.log("raw channels", data);
		{
				let joineddata : Channel[] = [];
				data[0].forEach((channel) => {adder(joineddata, channel)});
				joineddata.sort(function (a, b) {
					return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
				});
				combineddata = joineddata;
			}
			{
				let publicdata : Channel[] = [];
				data[1].forEach((channel) => {adder(publicdata, channel)});
				publicdata.sort(function (a, b) {
					return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
				});

				combineddata = combineddata.concat(publicdata.filter((channel) => !combineddata.some((value) => value.id === channel.id)));
			}
			setChannels(combineddata);
			setOwner(Array.from(owner));
			setAdmin(Array.from(admin));
			console.log("channels", combineddata);
			setHasLoaded(true);
		});
	}

	useEffect(() => {
		refreshChannels();
	}, []);

	let channelarea: JSX.Element[];
	if (!hasloaded) {
		channelarea = [<div key={0}>Loading...</div>, <i key={1} className="gg-spinner"></i>];
	} else if (channels.length > 0) {
		channelarea = channels.map((channel: Channel, index : number) => (
			<ChannelComponent key={index} channel={channel} joinChannel={joinChannel} canJoin={isConnectionOpen && !banned.includes(channel.id)} />
		));
	} else {
		channelarea = [<div key={0}>No channels found!</div>];
	}

	return (
		<>
		<div>
			<button
				aria-label="magic channel"
				onClick={() => joinChannel(magic_channel)}
				className="open-button"
				disabled={!isConnectionOpen || banned.includes(magic_channel)}
			>magic</button>
			<button
				aria-label="create channel"
				onClick={() => {modal.current?.showModal();}}
				disabled={!isConnectionOpen}
			>create</button>
			<button
				aria-label="refresh channels"
				onClick={() => refreshChannels()}
				disabled={!isConnectionOpen}
			>refresh</button>
			<ChannelEditor
				ref={modal}
				currentChannel=""
				create_or_update_channel={createChannel}
				defaultvisibility="public"
			/>
			<div>you are {sender} </div>
		</div>
		<div id="channel-list" className="scrollable">
			{channelarea}
		</div>
		</>
	);
}

function ChannelComponent({ channel, joinChannel, canJoin } : {channel: Channel, joinChannel: (channel_id: string) => void, canJoin: boolean}) {
	let icon = "";
	let hover = "";
	if (channel.visibility == 0 && channel.password) {
		icon = "gg-lock";
		hover = "password protected";
	} else if (channel.visibility == 1) {
		icon = "gg-shield";
		hover = "invite only";
	} else if (channel.visibility == 2) {
		icon = "gg-user";
		hover = "direct message";
	}
	return (
		<div className="channel" onClick={() => {if (canJoin) joinChannel(channel.id)}}>
			<div style={{overflowWrap:"anywhere"}}>{channel.name}</div>
			<div style={{display:"flex"}}>
				<i title={hover} className={icon}></i>
				<button
				aria-label="open channel"
				onClick={()=>{}}
				className="open-button"
				disabled={!canJoin}
			>open</button>
			</div>
		</div>
	);
}

export default ChannelList;