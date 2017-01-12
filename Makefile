.DEFAULT_GOAL:= build
MAKEFLAGS = -j1
PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
args = $(filter-out $@, $(MAKECMDGOALS))
.PHONY: all install clean deep-clean reinstall setup build compile build-source-maps compile-source-maps docs docs-server docs-build docs-compile watch lint test coverage test-coverage code-coverage report-coverage report-code-coverage ci prepatch patch minor major publish release

all: build test

install:
	npm install

# remove the build and log folders
clean:
	rm -rf dist logs

# remove all files that are ignored by git
deep-clean:
	make clean
	rm -rf node_modules/ dist/ .nyc_output/ npm-debug.log yarn-error.log

# reinstall the node_modules and start with a fresh node build
reinstall setup:
	make deep-clean
	make install

# build the source files
build compile:
	make clean
	babel app --out-dir dist $(args)

# makes it easier to build files with source maps without errors
# from other make commands
build-source-maps compile-source-maps:
	make clean
	babel app --out-dir dist --source-maps $(args)

# start the server for the documentation
docs docs-server:
	docs server

# compile the documentation
docs-build docs-compile:
	docs compile docs-public

# When watching for changes we can assume it's a development env
# so build files with source maps
watch:
	make build-source-maps -- --watch $(args)

# lint test files
lint:
	eslint 'app' 'test'

# run unit tests
test:
	ava $(args)

# run coverage for the tests
coverage test-coverage code-coverage:
	# if there's no instance source maps files then build the files with source maps
	@[ -f ./dist/index.js.map ] || (echo "building files with source maps" && make build-source-maps)
	NODE_ENV="test" nyc --statements 95 --functions 95 --lines 95 --check-coverage -- ava --verbose && exit 0 || exit 1

# These commands only run the report of the code coverage
report-coverage report-code-coverage:
	@[ -d ./.nyc_output ] && NODE_ENV="test" nyc report || make test-coverage


# The command the ci server runs
ci:
	make lint build-source-maps coverage -i

# "patch", "minor", "major", "prepatch",
VERS ?= "patch"

# "preminor", "premajor", "prerelease"
TAG ?= "latest"

# Release a prepatch version
prepatch:
	export VERS="prepatch" && make release

# Release a patch version
patch:
	export VERS="patch" && make release

# Release a minor version
minor:
	export VERS="minor" && make release

# Release a major version
major:
	export VERS="major" && make release

publish release:
	git checkout master
	git pull --rebase
	make ci
	npm version $(VERS) -m "Release %s"
	npm publish --tag $(TAG)
	git push --follow-tags origin master
