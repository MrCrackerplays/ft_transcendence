import { Request as HttpRequest } from "express";

export interface UserPayload {
	id: number;
}
export type AuthRequest = HttpRequest & { user: UserPayload }
