FROM node:24.3.0 AS builder
WORKDIR /app
ARG VITE_POCKETBASE_BASE_URL
ENV VITE_POCKETBASE_BASE_URL=${VITE_POCKETBASE_BASE_URL}
COPY package.json package-lock.json ./
RUN npm clean-install
COPY index.html justfile tailwind.config.js vite.config.ts drizzle.config.ts ./
COPY drizzle/ drizzle/
COPY public/ public/
COPY source/ source/
RUN npx just build-browser-application && npm prune --omit=dev

FROM node:24.3.0-alpine
ENV NODE_ENV production
COPY --from=builder /app/drizzle ./app/drizzle
COPY --from=builder /app/node_modules ./app/node_modules
COPY --from=builder /app/source/server ./app/source/server
COPY --from=builder /app/target/distribution/browser-application ./app/browser-application
COPY --from=builder /app/package.json ./app/package.json
COPY --from=builder /app/drizzle.config.ts ./app/drizzle.config.ts
RUN chown -R node:node /app

USER node
WORKDIR /app

EXPOSE 4000

CMD ["node", "source/server/entrypoint-production.ts"]
