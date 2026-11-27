# Run Code212 Quest with Docker

This optional setup runs the development stack in four containers: the Vite frontend, Laravel API, PostgreSQL, and Redis. The backend image uses PHP 8.4 to satisfy the versions locked in `apps/api/composer.lock`. You do not need to install Node.js, PHP, Composer, PostgreSQL, or Redis on the machine.

> This is a local development setup, not a production deployment. The API currently has known frontend/backend integration issues; the frontend therefore starts in mock mode by default.

## 1. Install Docker

Install Docker Desktop with the WSL 2 backend on Windows, or Docker Engine and the Docker Compose v2 plugin on Linux/macOS. Verify that Docker is running:

```sh
docker --version
docker compose version
```

## 2. Open a terminal at the project root

Change directory to the folder containing `compose.yaml`. On Windows, use PowerShell, Windows Terminal, or a WSL terminal.

## 3. Build and start the app

```sh
docker compose up --build
```

The first run downloads base images and installs the project dependencies inside the images, so it can take a few minutes. The command keeps the logs in the foreground.

Open **http://localhost:5173**. The frontend uses its local mock data by default; PostgreSQL and Redis are available to Laravel on the private Compose network.

To run the stack in the background instead:

```sh
docker compose up --build -d
docker compose ps
```

## 4. (Optional) Prepare the Laravel database

The mock frontend does not need the database. If you want to prepare the API database, run:

```sh
docker compose exec backend php artisan migrate --seed
```

This initializes the database with the project migrations and demo seed data. Migrations are not run automatically, so starting the containers will not change the database schema.

The real-API frontend mode is not the default and may encounter the integration issues noted above. To try it from PowerShell:

```powershell
$env:VITE_USE_MOCK = "false"
docker compose up --build
```

From a Bash-compatible shell:

```sh
VITE_USE_MOCK=false docker compose up --build
```

The Vite proxy forwards API requests to the backend container. To return to mock mode, stop the stack and start it again without setting `VITE_USE_MOCK`.

## 5. Stop or reset the stack

Stop and remove the containers while keeping the PostgreSQL data:

```sh
docker compose down
```

Start them again later with `docker compose up`. PostgreSQL data is kept in a named Docker volume on that machine; it is not automatically shared with other machines.

To **permanently delete the local database data** as well:

```sh
docker compose down --volumes
```

## Useful commands

```sh
docker compose logs -f                 # Follow logs from all services
docker compose logs -f backend          # Follow Laravel logs
docker compose exec backend sh          # Open a shell in the API container
docker compose exec backend php artisan migrate
docker compose ps                       # Show service status
```

If frontend or backend dependencies change, refresh the corresponding dependency volume:

```sh
docker compose run --rm --no-deps frontend npm ci
docker compose run --rm --no-deps backend composer install
```

If ports 5173 or 8000 are already in use, first stop the stack without deleting its database volume:

```powershell
docker compose down
```

In the **same PowerShell window** that you will use to start Compose, set alternate host-side ports and verify the frontend mapping:

```powershell
$env:CODE212_WEB_PORT = "5174"
$env:CODE212_API_PORT = "8001"
docker compose config | Select-String "5174"
docker compose up
```

In this example, open **http://localhost:5174**. The container ports remain unchanged; only the ports exposed on your machine change.

If you are using a WSL/Linux/macOS shell instead, use `export CODE212_WEB_PORT=5174` and `export CODE212_API_PORT=8001` in that same shell before running `docker compose config` and `docker compose up`.

The PostgreSQL username and password defaults are for local development only. You can override the database password by setting `CODE212_DB_PASSWORD` in the shell before starting Compose; never reuse these development credentials for a deployed environment.
