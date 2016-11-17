.DEFAULT_GOAL:= build
MAKEFLAGS = -j1
PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
args = $(filter-out $@, $(MAKECMDGOALS))
.PHONY: install clean deep-clean reinstall setup build compile watch lint test ci publish release

all: build test

install:
	if type yarn 2>/dev/null; then \
		yarn install; \
		echo "because yarn isn't pulling in the correct package"; \
		time npm install ma-shop/lint-rules tjbenton/ava-spec; \
	else \
		npm install; \
	fi

clean:
	rm -rf dist logs

deep-clean:
	make clean
	rm -rf node_modules/ dist/ .nyc_output/ npm-debug.log yarn-error.log

reinstall setup:
	make deep-clean
	make install

build compile:
	make clean
	babel app --out-dir dist $(args)

watch:
	make build -- --watch

lint:
	eslint 'app' 'test'

test:
	ava $(args)

ci:
	make lint
	make build
	make test

# "patch", "minor", "major", "prepatch",
VERS ?= "patch"

# "preminor", "premajor", "prerelease"
TAG ?= "latest"

prepatch:
	export VERS="prepatch" && make release

patch:
	export VERS="patch" && make release

minor:
	export VERS="minor" && make release

major:
	export VERS="major" && make release

publish release:
	git checkout master
	git pull --rebase
	make ci
	npm version $(VERS) -m "Release %s"
	npm publish --tag $(TAG)
	git push --follow-tags origin master
