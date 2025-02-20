---
title: Self hosting
parent: Cloud
order: 8
---

# Self-hosting Altair GraphQL Cloud

Altair GraphQL Cloud is a free and open-source software that you can host on your own server. This allows you to have full control over your data and privacy. You can also customize the software to fit your needs.

::: warning DISCLAIMER
Self-hosting Altair GraphQL Cloud requires technical knowledge and experience in server administration. As a small team, we are unable to provide extensive support or guarantees for self-hosting. However, we are happy to help with any questions you may have. For most users, we recommend using the [Altair GraphQL Cloud service](/cloud) instead.
:::

## Docker

### Prerequisites

Before you start self-hosting Altair GraphQL Cloud, you need to have the following:

- A server with at least 2GB of RAM and 2 CPU cores
- A domain name (optional, but recommended)
- A valid SSL certificate for your domain (required for security)
- Docker and Docker Compose installed on your server
- Basic knowledge of server administration

### Installation

There are two ways to install Altair GraphQL Cloud on your server using Docker:

1. Using the pre-built Docker image from Docker Hub
2. Building the Docker image from the source code

#### Using the pre-built Docker image

To install Altair GraphQL Cloud on your server using the pre-built Docker image, follow these steps:

1. Create a new directory on your server and navigate to it:

   ```bash
   mkdir altair-graphql-cloud
   cd altair-graphql-cloud
   ```

2. Create a new file named `docker-compose.yml` with the following content:

   ```yaml
   version: '3.8'

   services:
     altair-graphql-cloud:
       image: imolorhe/altairgraphqlapi
       ports:
         - '3000:3000'
       environment:
         - JWT_ACCESS_SECRET=your_access_secret
         - EVENTS_JWT_ACCESS_SECRET=your_events_access_secret
         - JWT_REFRESH_SECRET=your_refresh_secret
         - GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
         - GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
         - POSTGRES_DB=altair
         - POSTGRES_USER=altair
         - POSTGRES_PASSWORD=altair
         - DATABASE_URL=postgres://altair:altair@postgres:5432/altair
         - STRIPE_SECRET_KEY=your_stripe_secret_key
         - STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
       depends_on:
         - postgres
       restart: always

     postgres:
       image: postgres:13
       environment:
         - POSTGRES_DB=altair
         - POSTGRES_USER=altair
         - POSTGRES_PASSWORD=altair
       volumes:
         - ./postgres-data:/var/lib/postgresql/data
       restart: always
   ```

3. Replace the placeholders (`your_access_secret`, `your_events_access_secret`, `your_refresh_secret`, `your_google_oauth_client_id`, `your_google_oauth_client_secret`, `your_stripe_secret_key` and `your_stripe_webhook_secret`) with your own values. You can generate these secrets using a tool like [1Password](https://1password.com/password-generator/).
4. Run the following command to start Altair GraphQL Cloud:

   ```bash
   docker-compose up -d
   ```

5. Access Altair GraphQL Cloud in your web browser by visiting `http://your-server-ip:3000`.

#### Building the Docker image from the source code

To build the Docker image from the source code, follow these steps:

1. Clone the [Altair GraphQL repository](https://github.com/altair-graphql/altair)
2. Build the Docker image using the provided [Dockerfile](https://github.com/altair-graphql/altair/blob/master/Dockerfile)
3. Run the Docker image on your server using Docker Compose or Docker CLI:

   ```bash
   docker run -p 3000:3000 altair-graphql/altair
   ```

4. Access Altair GraphQL Cloud in your web browser

## Digitalocean

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/altair-graphql/altair/tree/master&refcode=345176f96acb)

## Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Faltair-graphql%2Faltair&env=JWT_ACCESS_SECRET,EVENTS_JWT_ACCESS_SECRET,JWT_REFRESH_SECRET,GOOGLE_OAUTH_CLIENT_ID,GOOGLE_OAUTH_CLIENT_SECRET,POSTGRES_DB,POSTGRES_USER,POSTGRES_PASSWORD,DATABASE_URL,STRIPE_SECRET_KEY&project-name=altair-graphql-api&redirect-url=https%3A%2F%2Faltairgraphql.dev%2F)

## Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/altair-graphql/altair)
