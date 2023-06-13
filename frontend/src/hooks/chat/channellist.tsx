import { useEffect, useRef } from "react";
import { Channel } from "./channeltypes";

function ChannelList( { sender, joinChannel, createChannel, isConnectionOpen, channels, setChannels, banned } : { sender: string, joinChannel: (channel_id: string) => void, createChannel: (channel_name: string, visibility: number, password: string) => Promise<boolean>, isConnectionOpen: boolean, channels: Channel[], setChannels: (channels: Channel[]) => void , banned: string[]} ) {
	const modal = useRef<HTMLDialogElement>(null);
	const createform = useRef<HTMLFormElement>(null);

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
			<ChannelComponent key={index} channel={channel} joinChannel={joinChannel} canJoin={isConnectionOpen && !banned.includes(channel.id)} />
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
			disabled={!isConnectionOpen || banned.includes(magic_channel)}
		>magic</button>
		<button
			aria-label="create channel"
			onClick={() => {modal.current?.showModal();}}
			disabled={!isConnectionOpen}
		>create</button>
		<dialog ref={modal}>
			<form ref={createform} method="dialog" onSubmit={async (e) => {
				let data = new FormData(createform.current!);
				let name = data.get("channel_name") as string;
				let visibility = data.get("visibility") as string;
				let password = data.get("password") as string;
				switch (visibility) {
					case "public":
						visibility = "0";
						password = "";
						break;
					case "protected":
						visibility = "3";
						if (password == "") {
							alert("You must enter a password for a protected channel!");
							e.preventDefault();
							return;
						}
						break;
					case "private":
						visibility = "1";
						password = "";
						break;
					default:
						visibility = "-1";
				}
				let success = await createChannel(name, parseInt(visibility), password);
				if (success) {
					createform.current?.reset();
				} else {
					alert("Failed to create channel '" + name + "'!");
				}
			}}>
				<input type="text" name="channel_name" placeholder="channel name" minLength={3} maxLength={16} pattern="^([a-zA-Z0-9_\-]*)$" required/>
				<div id="create_channel_visibility">
					<label>
						<input type="radio" name="visibility" value="public" id="createpublic" defaultChecked />
						public
					</label>
					<label>
						<input type="radio" name="visibility" value="protected" id="createprotected" />
						protected
						<input type="password" name="password" placeholder="password" minLength={3} maxLength={16} pattern="^([a-zA-Z0-9_\-]*)$" style={{marginLeft:"5px"}} />
					</label>
					<label>
						<input type="radio" name="visibility" value="private" id="createprivate" />
						private
					</label>
				</div>
				<button type="submit">create</button>
				<button type="button" onClick={() => modal.current?.close()}>cancel</button>
			</form>
		</dialog>
		<div>you are {sender} </div>
		{channelarea}
		</div>
	);
}

function ChannelComponent({ channel, joinChannel, canJoin } : {channel: Channel, joinChannel: (channel_id: string) => void, canJoin: boolean}) {
	return (
		<div className="channel" onClick={() => {if (canJoin) joinChannel(channel.id)}}>
			<div>{channel.name}</div>
			<button
			aria-label="open channel"
			onClick={()=>{}}
			className="open-button"
			disabled={!canJoin}
		>open</button>
		</div>
	);
}

export default ChannelList;