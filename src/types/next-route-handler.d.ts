import { NextRequest } from 'next/server';

declare global {
  type NextRouteHandler = (
    request: NextRequest,
    context: { params: Record<string, string> }
  ) => Promise<Response>;
}
