FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./server-utils/server_only_package.json package.json

RUN yarn install

COPY ./src ./src
COPY ./artifacts ./artifacts
COPY ./constants ./constants
COPY ./server-utils/server-only-hardhat.config.ts hardhat.config.ts
COPY ./server-utils/tsconfig.json .
COPY ./typechain-types ./typechain-types
COPY ./cat-mapping.ts .
COPY ./types ./types
COPY ./helper-hardhat-config.ts .
COPY ./utils ./utils


EXPOSE 5000

CMD ["yarn", "start"]