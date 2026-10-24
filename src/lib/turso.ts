import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | undefined;

export function getTursoClient() {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Turso is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
  }

  client = createClient({ url, authToken });
  return client;
}

export class StoreApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function databaseError(error: unknown) {
  console.error('Turso database request failed:', error);
  const message = error instanceof Error ? error.message : '';
  const status = error instanceof StoreApiError
    ? error.status
    : message.startsWith('Turso is not configured')
      ? 503
      : /constraint failed/i.test(message)
        ? 409
      : 500;
  const publicMessage = error instanceof StoreApiError
    ? message
    : status === 503
      ? message
      : status === 409
        ? 'The change conflicts with existing database records.'
        : /no such table/i.test(message)
          ? 'Turso tables are missing. Run server/db/schema.sql against your database.'
      : 'Database request failed.';

  return Response.json(
    { success: false, error: publicMessage },
    { status }
  );
}
