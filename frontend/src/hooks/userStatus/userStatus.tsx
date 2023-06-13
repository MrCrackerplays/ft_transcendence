import React, { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Constants } from "../../../../shared/constants";

function userStatus( winClose: Boolean) {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const ws = useRef<Socket>();

	useEffect(() => {
		console.log('updating user status');
		if (!ws.current)
			ws.current = io(Constants.BACKEND_URL + '/userStatusGateway')
		else if (winClose) {
			ws.current.on('status', () => {
				console.log('left page');
				ws.current?.emit('UPDATE', 'offline');
			})
		}
		else if (ws.current.disconnected) {
			ws.current.connect();
			ws.current.on('status', () => {
				console.log('connected to server');
				setIsConnectionOpen(true);
				if (ws.current?.connected)
					ws.current?.emit('UPDATE', 'online');
				else
					ws.current?.emit('UPDATE', 'offline');
			})
		}
		console.log(Constants.BACKEND_URL + '/userStatusGateway')
	}, [])
	return ;
}

window.addEventListener('unload', (event) => {
	console.log("left website.");
	userStatus( true );
});

export default userStatus;