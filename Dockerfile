FROM public.ecr.aws/docker/library/node:26.1.0-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm clean-install --omit=dev

COPY drizzle ./drizzle
COPY target/build/source/server ./source/server
COPY target/build/source/shared ./source/shared
COPY target/distribution/browser-application ./browser-application
COPY drizzle.config.js ./drizzle.config.js
RUN chown -R node:node /app

USER node

EXPOSE 4000

CMD ["node", "--enable-source-maps", "--import", "./source/server/instrument.js", "./source/server/entrypoint-production.js"]
