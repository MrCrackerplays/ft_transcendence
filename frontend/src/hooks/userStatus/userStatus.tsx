import React, { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Constants } from "../../../../shared/constants";

function UserStatus() {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const ws = useRef<Socket>();

	useEffect(() => {
		if (!ws.current) {
			ws.current = io(`${Constants.BACKEND_URL}/userStatusGateway`, {withCredentials: true});
		}
		else if (ws.current.disconnected) {
			ws.current.connect();
		}

		ws.current.on('connect', () => {
			setIsConnectionOpen(true);
		});

		ws.current.on('disconnect', () => {
			setIsConnectionOpen(true);
		});
	}, [])
	return (
		<></>
	);
}

export default UserStatus;