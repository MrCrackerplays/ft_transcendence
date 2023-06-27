import React, { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Constants } from "../../../../../shared/constants";

function TestMatchMakingConnection() {
	const [isConnectionOpen, setIsConnectionOpen] = useState(false);
	const ws = useRef<Socket>();

	const joinQueue = (gamemode: string) => {
		ws.current?.emit("subscribe", {gamemode}, (response: boolean) => {
			console.log("emit join queue");
		});
	}

	useEffect(() => {
		if (!ws.current) {
			console.log(`${Constants.BACKEND_URL}/matchMakingGateway`);
			ws.current = io(`${Constants.BACKEND_URL}/matchMakingGateway`, {withCredentials: true});
			console.log('new socket established');
		}
		else if (ws.current.disconnected) {
			ws.current.connect();
			console.log('connect with current socket');
		}

		ws.current.on('connect', () => {
			console.log('connection established');
			ws.current?.emit("join_queue", "pong");
			setIsConnectionOpen(true);
		});

		ws.current.on('disconnect', () => {
			setIsConnectionOpen(false);
			console.log('Disconnected from pong');
		});

		ws.current.on('joined_queue', () => {
			console.log("joined queue");
		})

		return () => {
			ws.current?.close();
			console.log("cleaning queue");
		}
	}, []);
	
	return (
		<p>pong</p>
	)
}

export default TestMatchMakingConnection;