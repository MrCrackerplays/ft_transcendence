import { Injectable } from "@nestjs/common";
import { Socket } from 'socket.io';

@Injectable()
export class MatchMakingService {
	private queues: Map<string, Socket[]> = new Map();

	addClientToQueue(queue: string, client: Socket) {
		client.join(queue);

		if (!this.queues.has(queue))
			this.queues.set(queue, []);
		this.queues.get(queue).push(client)
	}

	removeClientFromQueue(queue: string, client: Socket) {
		const clients  = this.queues.get(queue);
		if (clients) {
			const index = clients.indexOf(client);
			if (index != -1) {
				clients.splice(index, 1);
			}
		}
		client.leave(queue);
	}

	matchClientsInQueue(queue: string) {
		const clients = this.queues.get(queue)

		if (clients && clients.length >= 2) {
			const client1 = clients[0];
			const client2 = clients[1];
			const gameRoom = 'gameRoom';
		}
	}

	moveClientsToRoom(client1: Socket, client2: Socket, room: string) {
		const currentQueue = this.getClientRoom(client1);
		this.removeClientFromQueue(currentQueue, client1);
		this.removeClientFromQueue(currentQueue, client2);

		
	}

	getClientRoom(client: Socket): string {
		for (const [queue, clients] of this.queues) {
			if (clients.includes(client))
				return queue;
		}
		return null;
	}

	getClientsInQueue(queue: string): Socket[] {
		return this.queues.get(queue) || [];
	}
}