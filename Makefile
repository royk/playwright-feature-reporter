.PHONY: test test-watch build release

test:
	npm test

test-watch:
	PWTEST_WATCH=1 npm test	

build:
	npm run build

release:
	npm run release