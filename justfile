default:
  just --list

lint:
	npx prettier --check .
	npx eslint .

test:
	npx nuxi typecheck

build:
	npx nuxt build

develop:
	npx nuxt dev

generate:
	npx nuxt generate

preview:
	npx nuxt preview
