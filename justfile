export PATH := "./node_modules/.bin:" + env_var('PATH')

default:
	@just --list

@prepare:
	npx nuxi prepare

lint-fix:
	npx prettier --log-level warn --write .
	npx eslint --fix .

lint:
	npx prettier --check .
	npx eslint .

test-unit *options:
	npx vitest {{options}}

test: && lint (test-unit "--run")
	npx nuxi typecheck

@build:
	npx nuxi build

@develop:
	npx concurrently --kill-others --kill-others-on-fail --names "deterministic-server,nuxt" "tsx watch --clear-screen=false ./deterministic-server/server.ts" "wait-on http://localhost:8081 && npx nuxi dev"

generate:
	npx nuxt generate

preview:
	npx nuxt preview
