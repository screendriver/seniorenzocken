default:
	@just --list

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
	npx nuxi dev

generate:
	npx nuxt generate

preview:
	npx nuxt preview
