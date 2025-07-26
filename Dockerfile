FROM node:24.4.1 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm clean-install
COPY . .
RUN npx just compile && npx just build-browser-application && npm prune --omit=dev

FROM node:24.4.1-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder ./drizzle ./drizzle
COPY --from=builder ./node_modules ./node_modules
COPY --from=builder ./target/build/source/server ./source/server
COPY --from=builder ./target/build/source/shared ./source/shared
COPY --from=builder ./target/distribution/browser-application ./browser-application
COPY --from=builder ./package.json ./package.json
COPY --from=builder ./drizzle.config.ts ./drizzle.config.ts
RUN chown -R node:node /app

USER node

EXPOSE 4000

CMD ["node", "source/server/entrypoint-production.ts"]
