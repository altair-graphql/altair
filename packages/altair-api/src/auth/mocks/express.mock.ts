import { Request, Response } from 'express';

export function mockRequest(props?: object): Request {
  return { ...props } as Request;
}

export function mockResponse(props?: object): Response {
  return { ...props } as Response;
}
