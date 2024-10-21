.PHONY: test lint test-watch build release commit-types

test:
	npm test

lint:
	npx eslint . --fix

test-watch:
	PWTEST_WATCH=1 npm test	

build:
	npm run build

release:
	npm run release

commit-types:
	git log --pretty=format:%s | grep -o '^[a-zA-Z]*' | sort | uniq -c | sort -nr