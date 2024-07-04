default:
	@just --list

@prepare:
	npx nuxi prepare

lint-fix:
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
	npx concurrently --kill-others --kill-others-on-fail --names "deterministic-server,nuxt" "tsx ./deterministic-server/server.ts" "wait-on http://localhost:8081 && npx nuxi dev"

generate:
	npx nuxt generate

preview:
	npx nuxt preview
