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
	concurrently --kill-others --kill-others-on-fail --names "server,vite" "node --watch --watch-preserve-output source/server/entrypoint-local.ts" "npx vite"

@build-browser-application:
	vite build

preview:
	vite preview
