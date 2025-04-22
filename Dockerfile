FROM caddy:2.10.0-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY target/dist/ /usr/share/caddy
