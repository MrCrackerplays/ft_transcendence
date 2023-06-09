import { Request as HttpRequest } from "express";
import { Payload } from "src/auth/interfaces/payload.interface";

export type AuthRequest = HttpRequest & { user: Payload }
