MAKEFLAGS = -j1
PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
args = $(filter-out $@, $(MAKECMDGOALS))

.PHONY: all lint test-only test build coverage publish rebuild release

all: build test

clean:
	rm -rf ./dist

build:
	babel app -d dist $(args)

lint:
	eslint app

test-only:
	tape -r babel-register test/**/*.test.js | tap-spec

test: lint test-only

publish: all
	npm publish

rebuild:
	rm -rf node_modules/ dist/ .nyc_output/ npm-debug.log
	npm i
	make build

VERS ?= "patch"
TAG ?= "latest"

release:
	git checkout master
	git pull --rebase
	make build
	make test
	npm version $(VERS) -m "Release %s"
	npm publish --tag $(TAG)
	git push --follow-tags
