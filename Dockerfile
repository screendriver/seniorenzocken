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
WORKDIR /app
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/source/server ./source/server
COPY --from=builder /app/target/distribution/browser-application ./browser-application
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
RUN chown -R node:node /app

USER node

EXPOSE 4000

CMD ["node", "source/server/entrypoint-production.ts"]
