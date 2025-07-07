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

test: compile lint (test-unit "--run") check-database-consistency

[group("database")]
generate-database-migrations:
	drizzle-kit generate

[group("database")]
check-database-consistency:
	drizzle-kit check

@develop:
	VITE_TRPC_SERVER_URL=http://localhost:4000/trpc concurrently --kill-others --kill-others-on-fail --names "server,deterministic-server,vite" "node --watch --watch-preserve-output source/server/entrypoint-local.ts" "tsx watch --clear-screen=false ./deterministic-server/server.ts" "wait-on http://localhost:8081 && npx vite"

@build-browser-application:
	vite build

preview:
	vite preview
