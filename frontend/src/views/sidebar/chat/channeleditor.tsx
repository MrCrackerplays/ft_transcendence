import { forwardRef, useRef } from "react";

const ChannelEditor = forwardRef<HTMLDialogElement, {currentChannel: string, defaultvisibility: string, create_or_update_channel: (id_or_name: string, visibility: number, password: string) => Promise<boolean>, on_success?: null | (() => void)}>(
	({currentChannel, defaultvisibility, create_or_update_channel, on_success = null}, modal) => {
		if (modal == null || typeof modal === 'function')
			return (<></>);
		const visibilityForm = useRef<HTMLFormElement>(null);

		let nameinput = (<></>);
		if (currentChannel === "") {
			nameinput = (
				<input type="text" name="channel_name" placeholder="channel name" minLength={3} maxLength={16} pattern="^([a-zA-Z0-9_\-]*)$" required/>
			);
		}

		let mode = "update";
		if (currentChannel === "")
			mode = "create";

		return (
			<dialog ref={modal} className="modal">
				<form ref={visibilityForm} method="dialog" onSubmit={async (e) => {
					let data = new FormData(visibilityForm.current!);
					let visibility = data.get("visibility") as string;
					let password = data.get("password") as string;
					switch (visibility) {
						case "public":
							visibility = "0";
							password = "";
							break;
						case "protected":
							visibility = "0";
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
						case null:
							alert("You must select a visibility for the channel!");
							e.preventDefault();
							return;
						default:
							visibility = "-1";
					}
					let success = await create_or_update_channel(currentChannel !== "" ? currentChannel : data.get("channel_name") as string, parseInt(visibility), password);
					if (success) {
						visibilityForm.current?.reset();
						if (on_success !== null) {
							on_success();
						}
					} else {
						alert("Failed to " + mode + " channel!");
					}
				}}>
					{nameinput}
					<div className="edit_channel_visibility">
						<label>
							<input type="radio" name="visibility" value="public" id={mode + "public"} defaultChecked={defaultvisibility == "public"}
							 />
							public
						</label>
						<label>
							<input type="radio" name="visibility" value="protected" id={mode + "protected"} />
							protected
							<input type="password" name="password" placeholder="password" minLength={3} maxLength={16} pattern="^([a-zA-Z0-9_\-]*)$" style={{marginLeft:"5px"}} />
						</label>
						<label>
							<input type="radio" name="visibility" value="private" id={mode + "private"} />
							private
						</label>
					</div>
					<button type="submit">{mode}</button>
					<button type="button" onClick={() => modal.current?.close()}>cancel</button>
				</form>
			</dialog>
		);
	}
);

export default ChannelEditor;