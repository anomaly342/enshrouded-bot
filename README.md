# Enshrouded Discord bot

Discord bot for a containerized Enshrouded server. `/start` and `/stop` start and stop the game server container on the same machine.

The bot runs in Docker and talks to the local Docker engine through a socket proxy. It can only control a container that exists on that engine. Set `CONTAINER_NAME` to that container's name.

## Setup

Create `src/.env`:

```env
TOKEN=
CLIENT_ID=
OWNER_ID=
CONTAINER_NAME=enshrouded-proton
```

`TOKEN` is the bot token. `CLIENT_ID` is the application id. `OWNER_ID` is the Discord user id allowed to run the message commands.

## Run

From this directory, with Docker already running:

```bash
docker compose --env-file src/.env up -d --build
```

That starts the socket proxy and the bot. Logs:

```bash
docker compose logs -f enshrouded-bot
```
