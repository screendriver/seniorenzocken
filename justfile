export PATH := "./node_modules/.bin:" + env_var("PATH")
export NODE_OPTIONS := "--max-old-space-size=4096 --disable-warning=ExperimentalWarning"

default:
	@just --list

compile:
	vue-tsc --build

lint:
	prettier --check .
	eslint . --cache --cache-location "./target/eslintcache" --cache-strategy content --max-warnings 0

lint-fix:
	prettier --log-level warn --write .
	eslint --fix .

test-unit *options:
	vitest {{options}}

test: compile lint (test-unit "--run") check-database-consistency

[group("database")]
generate-database-migrations: compile
	drizzle-kit generate

[group("database")]
check-database-consistency:
	drizzle-kit check

@develop:
	concurrently --kill-others --kill-others-on-fail --names "server,vite" "tsx watch --clear-screen=false source/server/entrypoint-local.ts" "vite"

@build-browser-application:
	vite build

preview:
	vite preview
