export PATH := "./node_modules/.bin:" + env_var('PATH')

default:
	@just --list

@prepare:
	nuxi prepare

lint-fix:
	prettier --log-level warn --write .
	eslint --fix .

lint:
	prettier --check .
	eslint .

test-unit *options:
	vitest {{options}}

test: && lint (test-unit "--run")
	nuxi typecheck

@build:
	nuxi build

@develop:
	concurrently --kill-others --kill-others-on-fail --names "deterministic-server,nuxt" "tsx watch --clear-screen=false ./deterministic-server/server.ts" "wait-on http://localhost:8081 && npx nuxi dev"

generate:
	nuxt generate

preview:
	nuxt preview
