FROM node:24.4.1 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm clean-install
COPY . .
RUN npx just compile && npx just build-browser-application && npm prune --omit=dev

FROM node:24.4.1-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/target/build/source/server ./source/server
COPY --from=builder /app/target/build/source/shared ./source/shared
COPY --from=builder /app/target/distribution/browser-application ./browser-application
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
RUN chown -R node:node /app

USER node

EXPOSE 4000

CMD ["node", "--enable-source-maps", "source/server/entrypoint-production.js"]
