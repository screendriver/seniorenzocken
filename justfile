default:
  just --list

lint:
	npx prettier --check .

build:
	npx nuxt build

develop:
	npx nuxt dev

generate:
	npx nuxt generate

preview:
	npx nuxt preview
