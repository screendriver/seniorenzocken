FROM node:22.4.0 as build
WORKDIR /app
COPY package*.json ./
RUN npm clean-install
COPY . .
RUN npx just build

FROM node:22.4.0-alpine as runtime
RUN mkdir -p /home/node/app && chown --recursive node:node /home/node/app
WORKDIR /home/node/app
USER node
COPY --chown=node:node --from=build /app/.output .
EXPOSE 3000
CMD [ "node", "./server/index.mjs" ]

