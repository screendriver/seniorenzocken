FROM public.ecr.aws/docker/library/node:24.6.0 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm clean-install
COPY . .
RUN npx just compile && npx just build-browser-application && npm prune --omit=dev
RUN find . \( -name "*.d.ts" -o -name "*.d.ts.map" \) -type f -delete

FROM public.ecr.aws/docker/library/node:24.6.0-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/target/build/source/server ./source/server
COPY --from=builder /app/target/build/source/shared ./source/shared
COPY --from=builder /app/target/distribution/browser-application ./browser-application
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.js ./drizzle.config.js
RUN chown -R node:node /app

USER node

EXPOSE 4000

CMD ["node", "--enable-source-maps", "--import", "./source/server/instrument.js", "./source/server/entrypoint-production.js"]
