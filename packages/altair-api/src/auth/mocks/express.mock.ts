import { Request, Response } from 'express';

export function mockRequest(props?: Partial<Request>): Request {
  return { ...props } as Request;
}

export function mockResponse(props?: Partial<Response>): Response {
  return { ...props } as Response;
}
