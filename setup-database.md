# Database Setup Guide

## Current Issue
You're getting 500 Internal Server Errors because the `DATABASE_URL` environment variable is not set. The application is trying to connect to a PostgreSQL database but can't find the connection string.

## Solution Options

### Option 1: Set up a local PostgreSQL database

1. **Install PostgreSQL** (if not already installed):
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create a database**:
   ```sql
   CREATE DATABASE inventory_master;
   ```

3. **Set the environment variable**:
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory_master"
   
   # Or create a .env file (if not blocked by gitignore)
   DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_master
   ```

### Option 2: Use a cloud database

1. **Neon (PostgreSQL as a Service)**:
   - Sign up at https://neon.tech
   - Create a new project
   - Copy the connection string
   - Set it as `DATABASE_URL`

2. **Supabase**:
   - Sign up at https://supabase.com
   - Create a new project
   - Go to Settings > Database
   - Copy the connection string

3. **Railway**:
   - Sign up at https://railway.app
   - Create a new PostgreSQL service
   - Copy the connection string

### Option 3: Use SQLite for development (temporary)

If you want to get started quickly without setting up PostgreSQL, you can temporarily modify the application to use SQLite:

1. Install SQLite dependencies:
   ```bash
   npm install better-sqlite3 drizzle-orm/better-sqlite3
   ```

2. Update the database configuration to use SQLite instead of PostgreSQL.

## Setting the Environment Variable

### For Windows PowerShell:
```powershell
$env:DATABASE_URL="your_connection_string_here"
npm run dev
```

### For Windows Command Prompt:
```cmd
set DATABASE_URL=your_connection_string_here
npm run dev
```

### For permanent setup (create a .env file):
Create a file named `.env` in your project root with:
```
DATABASE_URL=your_connection_string_here
```

## Database Schema Setup

Once you have the database connection set up, you'll need to create the database tables. The application uses Drizzle ORM with the schema defined in `shared/schema.ts`.

Run the following command to push the schema to your database:
```bash
npx drizzle-kit push
```

## Testing the Connection

After setting up the database connection, restart your development server:
```bash
npm run dev
```

The application should now work without 500 errors, and you should see "Database connection established successfully" in the console.

## Troubleshooting

1. **Connection refused**: Make sure PostgreSQL is running and the port is correct
2. **Authentication failed**: Check your username and password
3. **Database does not exist**: Create the database first
4. **Permission denied**: Make sure your user has the necessary permissions

## Example Connection Strings

- **Local PostgreSQL**: `postgresql://postgres:password@localhost:5432/inventory_master`
- **Neon**: `postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database`
- **Supabase**: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres` 