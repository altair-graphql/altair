FROM node:16.13-alpine AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build


FROM node:16.13-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG ALTAIR_SERVER_PORT=3000
ENV ALTAIR_SERVER_PORT=${ALTAIR_SERVER_PORT}

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production=true

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD [ "node", "dist/main" ]
