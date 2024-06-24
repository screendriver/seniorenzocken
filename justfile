default: develop

lint:
	npx prettier --check .
	npx eslint .

test-unit *options:
	npx vitest {{options}}

test: && (test-unit "--run") lint
	npx nuxi typecheck

@build:
	npx nuxi build

@develop:
	npx nuxi dev

generate:
	npx nuxt generate

preview:
	npx nuxt preview
