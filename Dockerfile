FROM node:lts AS runtime
WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install
RUN pnpm run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs