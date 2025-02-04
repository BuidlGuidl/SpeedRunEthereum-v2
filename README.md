# SpeedRunEthereum v2

The new SpeedRunEthereum!

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.18)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- [Docker Engine](https://docs.docker.com/engine/install/)

## Development Quickstart

1. Install dependencies

```
yarn install
```

2. Spin up the Postgres database service + create database + seed

```
docker compose up -d
yarn drizzle-kit push
yarn db:seed
```

3. Start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`.

## Database (dev info)

We are using Drizzle with Postgres. You can run `drizzle-kit` from the root with `yarn drizzle-kit`

To iterate on the database:

- Tweak the schema in `schema.ts`
- Run `yarn drizzle-kit push` to apply the changes.
- Tweak `seed.js` if needed + run `yarn seed` (will delete existing data)
- You can explore the database with `yarn drizzle-kit studio`

After the initial iterations, we'll start using migrations (`yarn drizzle-kit generate` & `yarn drizzle-kit migrate`)
