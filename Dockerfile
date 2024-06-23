FROM node:22.3.0 as build
WORKDIR /app
COPY package*.json ./
RUN npm clean-install
COPY . .
RUN npx just build

FROM node:22.3.0-alpine as runtime
RUN mkdir -p /home/node/app/node_modules && chown --recursive node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install --no-save --omit=dev && rm -rf .nuxt
COPY --chown=node:node --from=build /app/.output .
EXPOSE 3000
CMD [ "node", "./server/index.mjs" ]

