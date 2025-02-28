FROM caddy:2.9.1-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY target/dist/ /usr/share/caddy
