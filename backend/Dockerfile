
FROM node:23.5.0-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts
COPY . .


FROM node:23.5.0-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .
EXPOSE 3001
CMD [ "node", "server.js" ]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:3001/health || exit 1