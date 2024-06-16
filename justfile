default: develop

svelte-kit-sync:
	npx svelte-kit sync

lint: svelte-kit-sync
	npx svelte-check --tsconfig ./tsconfig.json
	npx prettier --check source
	npx eslint . --ext ".ts,.svelte"
	npx ls-lint

compile: svelte-kit-sync
	npx tsc

develop:
	npx tsx ./source/start-develop.ts

build: svelte-kit-sync
	npx vite build

preview:
	npx vite preview --port 4173 --strictPort 

@test-unit: compile
	npx ava

@test-unit-coverage: compile
	npx c8 ava

@test-end-to-end: svelte-kit-sync
	npx playwright test --config=test/end-to-end/playwright.config.ts

@preview-end-to-end:
	npx tsx ./source/preview-end-to-end.ts

