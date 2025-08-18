# Build Angular app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve static build with a tiny web server
FROM caddy:2-alpine
WORKDIR /srv
COPY --from=build /app/dist/accounts-docs-frontend/browser ./
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
