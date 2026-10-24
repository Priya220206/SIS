# Turso database setup

## Upload the SQLite file to Turso

`sim.db` is a valid SQLite database in **WAL journal mode**, containing the SIM tables, indexes, and views from `schema.sql`. WAL mode is required by Turso's file upload. It is schema-only: it does not contain sample/fake store records.

Install and authenticate the Turso CLI, then from the repository root create a Turso database from the file:

```powershell
turso db create sim --from-file server\db\sim.db
```

If the database already exists, create a new database from the file or import the file into the existing database using the Turso CLI workflow for your version. Do not upload the empty file over an existing database containing records.

## Configure the application

1. Generate an auth token for the database.
2. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from `.env.example` to `.env.local`, preserving the existing Supabase authentication variables.
3. Populate `store_zones`, `shelf_units`, `products`, `inventory`, and (optionally) `replenishment_tasks` with your store's records.

The application reads these tables through server-side API routes. It does not seed demo records or return mock data when the database is empty or unavailable. Client screens refresh their data every five seconds; Turso does not push database change events to this app.

The existing Supabase variables remain for authentication only. Turso credentials must stay server-side and must not use a `NEXT_PUBLIC_` prefix.
