import React, { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Constants } from "../../../../shared/constants";

function UserStatus() {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const ws = useRef<Socket>();

	useEffect(() => {
		// console.log('updating user status');
		if (!ws.current) {
			// console.log(`${Constants.BACKEND_URL}/userStatusGateway`);
			ws.current = io(`${Constants.BACKEND_URL}/userStatusGateway`, {withCredentials: true});
			// console.log(`${ws.current}`);
		}
		else if (ws.current.disconnected) {
			ws.current.connect();
		}

		ws.current.on('connect', () => {
			console.log('Connected to server');
			setIsConnectionOpen(true);
		});

		ws.current.on('disconnect', () => {
			console.log('Disconnected from server');
			setIsConnectionOpen(true);
		});
	}, [])
	return (
		<></>
	);
}

export default UserStatus;