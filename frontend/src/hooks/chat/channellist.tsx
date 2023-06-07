import { useEffect } from "react";

function ChannelList( { sender, setCurrentChannel, isConnectionOpen, channels, setChannels } : { sender: string, setCurrentChannel: (channel: string) => void, isConnectionOpen: boolean, channels: string[], setChannels: (channels: string[]) => void } ) {
	const magic_channel = "3e809453-5734-482c-aa2a-8fc311f0cd4e";

	useEffect(() => {
		console.log("channellist rendered");
	}, []);

	return (
		<div id="channel-list">
		<button
			aria-label="magic channel"
			onClick={() => setCurrentChannel(magic_channel)}
			className="open-button"
			disabled={!isConnectionOpen}
		>magic</button>
		<div>you are {sender} </div>
		{channels.map((channel: string, index : number) => (
			<ChannelComponent key={index} channel={channel} setCurrentChannel={setCurrentChannel} isConnectionOpen={isConnectionOpen} />
		))}
		</div>
	);
}

function ChannelComponent({ channel, setCurrentChannel, isConnectionOpen } : {channel: string, setCurrentChannel: (channel: string) => void, isConnectionOpen: boolean}) {
	return (
		<div className="channel">
			{channel}
			<button
			aria-label="open channel"
			onClick={() => setCurrentChannel(channel)}
			className="open-button"
			disabled={!isConnectionOpen}
		>open</button>
		</div>
	);
}

export default ChannelList;