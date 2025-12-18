# PostgreSQL Database Setup Guide

This guide will help you set up a local PostgreSQL database using Docker for the Students Management System.

## Prerequisites

- Docker and Docker Compose installed on your system
  - [Install Docker](https://docs.docker.com/get-docker/)
  - Docker Compose is usually included with Docker Desktop

## Quick Start

### 1. Start PostgreSQL Container

Run the following command in the `pr-4` directory:

```bash
docker-compose up -d
```

This will:
- Download the PostgreSQL 15 Alpine image (if not already present)
- Create a container named `students_postgres`
- Start the database on port `5433` (host) mapping to `5432` (container)
- Create a database named `students_db`
- Set up a user `postgres` with password `postgres`

### 2. Verify the Container is Running

```bash
docker-compose ps
```

You should see the `postgres` service with status "Up" and health check passing.

### 3. Check Container Logs (Optional)

```bash
docker-compose logs postgres
```

### 4. Connect to the Database (Optional)

You can connect to the database using any PostgreSQL client:

**Using psql (if installed locally):**
```bash
psql -h localhost -p 5433 -U postgres -d students_db
```

**Using Docker:**
```bash
docker exec -it students_postgres psql -U postgres -d students_db
```

**Connection Details:**
- Host: `localhost`
- Port: `5433` (Note: Using 5433 to avoid conflict with local PostgreSQL on 5432)
- Database: `students_db`
- Username: `postgres`
- Password: `postgres`

### 5. Stop the Container

When you're done working:

```bash
docker-compose down
```

This stops the container but keeps the data. To remove the data volume as well:

```bash
docker-compose down -v
```

## Environment Variables

You can customize the database configuration by creating a `.env` file in the `pr-4` directory:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=students_db
DB_USER=postgres
DB_PASSWORD=postgres
```

Or modify the `docker-compose.yml` file directly.

## Using DatabaseConnector

After starting the PostgreSQL container, you can use the `DatabaseConnector` class in your code:

```javascript
const { DatabaseConnector } = require('./DatabaseConnector');

const db = new DatabaseConnector();

async function main() {
    try {
        // Connect to database
        await db.connect();
        
        // Execute queries
        const result = await db.query('SELECT NOW()');
        console.log(result.rows);
        
        // Use transactions
        await db.transaction(async (client) => {
            await client.query('INSERT INTO students (name, age) VALUES ($1, $2)', ['John', 20]);
            await client.query('INSERT INTO students (name, age) VALUES ($1, $2)', ['Jane', 21]);
        });
        
        // Close connection when done
        await db.disconnect();
    } catch (error) {
        console.error('Database error:', error);
    }
}

main();
```

## Troubleshooting

### Port Already in Use

If you prefer to use port 5432 instead, you'll need to stop your local PostgreSQL service first:

```bash
sudo systemctl stop postgresql
```

Then update `docker-compose.yml` to use port 5432:

```yaml
ports:
  - "5432:5432"
```

And update `DatabaseConnector.js` default port back to 5432.

### Container Won't Start

1. Check if another PostgreSQL container is running:
   ```bash
   docker ps -a
   ```

2. Remove conflicting containers:
   ```bash
   docker rm -f students_postgres
   ```

3. Try starting again:
   ```bash
   docker-compose up -d
   ```

### Connection Refused

1. Ensure the container is running:
   ```bash
   docker-compose ps
   ```

2. Check container logs for errors:
   ```bash
   docker-compose logs postgres
   ```

3. Verify the health check:
   ```bash
   docker inspect students_postgres | grep Health -A 10
   ```

### Reset Database

To completely reset the database (removes all data):

```bash
docker-compose down -v
docker-compose up -d
```

## Data Persistence

The database data is stored in a Docker volume named `postgres_data`. This means:
- Data persists even if you stop the container
- Data is removed only if you use `docker-compose down -v`
- To backup data, you can export the volume or use `pg_dump`

## Next Steps

After setting up the database:

1. **Run migrations and seeders:**
   ```bash
   npm run db:setup
   ```
   This will create the `students` table and add initial student data.

2. **Use Sequelize in your code:**
   ```javascript
   const db = require('./models');
   
   // Example: Get all students
   const students = await db.Student.findAll();
   ```

3. **See examples:**
   - `example-sequelize-usage.js` - Complete examples of using Sequelize
   - `models/Student.js` - Student model definition
   - `migrations/` - Database migration files
   - `seeders/` - Initial data seeders

The project uses **Sequelize ORM** for database operations. See the main README.md for more details.

