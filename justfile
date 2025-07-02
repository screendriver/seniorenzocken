export PATH := "./node_modules/.bin:" + env_var("PATH")

default:
	@just --list

lint:
	prettier --check .
	eslint .

lint-fix:
	prettier --log-level warn --write .
	eslint --fix .

test-unit *options:
	vitest {{options}}

test: && lint (test-unit "--run")
	vue-tsc --build

@develop:
	concurrently --kill-others --kill-others-on-fail --names "deterministic-server,vite" "tsx watch --clear-screen=false ./deterministic-server/server.ts" "wait-on http://localhost:8081 && npx vite"

@build-browser-application:
	vite build

preview:
	vite preview
