import { useEffect } from "react";
import { Channel } from "./channeltypes";

function ChannelList( { sender, joinChannel, isConnectionOpen, channels, setChannels } : { sender: string, joinChannel: (channel_id: string) => void, isConnectionOpen: boolean, channels: Channel[], setChannels: (channels: Channel[]) => void } ) {
	const magic_channel = "3e809453-5734-482c-aa2a-8fc311f0cd4e";

	useEffect(() => {
		fetch("http://localhost:3000/channels/", {credentials: 'include'}).then(res => res.json()).then(async (data) => {
			data = data.map((channel) => {
				return {id: channel.id, name: channel.name, visibility: channel.visibility};
			});
			setChannels(data);
			console.log("channels", data);
		});
		console.log("channellist rendered");
	}, []);

	let channelarea: JSX.Element[];
	if (channels.length > 0) {
		channelarea = channels.map((channel: Channel, index : number) => (
			<ChannelComponent key={index} channel={channel} joinChannel={joinChannel} isConnectionOpen={isConnectionOpen} />
		));
	} else {
		channelarea = [<div key={0}>No channels found!</div>];
	}

	return (
		<div id="channel-list">
		<button
			aria-label="magic channel"
			onClick={() => joinChannel(magic_channel)}
			className="open-button"
			disabled={!isConnectionOpen}
		>magic</button>
		<div>you are {sender} </div>
		{channelarea}
		</div>
	);
}

function ChannelComponent({ channel, joinChannel, isConnectionOpen } : {channel: Channel, joinChannel: (channel_id: string) => void, isConnectionOpen: boolean}) {
	return (
		<div className="channel">
			{channel.name}
			<button
			aria-label="open channel"
			onClick={() => joinChannel(channel.id)}
			className="open-button"
			disabled={!isConnectionOpen}
		>open</button>
		</div>
	);
}

export default ChannelList;