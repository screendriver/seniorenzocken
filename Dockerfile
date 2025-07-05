FROM node:24.3.0 AS builder
WORKDIR /app
ARG VITE_POCKETBASE_BASE_URL
ENV VITE_POCKETBASE_BASE_URL=${VITE_POCKETBASE_BASE_URL}
COPY package.json package-lock.json ./
RUN npm clean-install
COPY index.html justfile tailwind.config.js vite.config.ts ./
COPY drizzle/ drizzle/
COPY public/ public/
COPY source/ source/
RUN npx just build-browser-application && npm prune --omit=dev

FROM node:24.3.0-alpine
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
COPY --from=builder --chown=nodejs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/source/server ./source/server
COPY --from=builder --chown=nodejs:nodejs /app/target/distribution/browser-application ./browser-application
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs
EXPOSE 4000

CMD ["node", "source/server/entrypoint-production.ts"]
