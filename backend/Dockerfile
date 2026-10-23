# Node patch version is pinned here on purpose: Nixpacks only picks a major
# version and lags behind on patch releases. Bump this tag with each Node
# security release.
FROM node:22.23.4-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
