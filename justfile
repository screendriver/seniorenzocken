export PATH := "./node_modules/.bin:" + env_var("PATH")
export NODE_OPTIONS := "--disable-warning=ExperimentalWarning"

default:
	@just --list

compile:
	vue-tsc --build

lint:
	prettier --check .
	eslint .

lint-fix:
	prettier --log-level warn --write .
	eslint --fix .

test-unit *options:
	vitest {{options}}

test: compile lint (test-unit "--run")

generate-database-migrations:
	drizzle-kit generate

start-local-server: generate-database-migrations
	node --watch --watch-preserve-output source/server/entrypoint-local.ts

@develop:
	concurrently --kill-others --kill-others-on-fail --names "server,deterministic-server,vite" "tsx watch --clear-screen=false ./source/server/server.ts" "tsx watch --clear-screen=false ./deterministic-server/server.ts" "wait-on http://localhost:8081 && npx vite"

@build-browser-application:
	vite build

preview:
	vite preview
