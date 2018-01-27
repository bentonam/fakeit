.DEFAULT_GOAL:= build
MAKEFLAGS = -j1
PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
args = $(filter-out $@, $(MAKECMDGOALS))
.PHONY: all install clean deep-clean reinstall setup build compile build-source-maps compile-source-maps docs docs-server docs-build docs-compile watch lint test coverage test-coverage code-coverage report-coverage report-code-coverage ci prepatch patch minor major publish release

all: build test

install:
	@npm install
	@lerna bootstrap
	@flow-typed install

# remove the build and log folders
clean:
	@rm -rf dist logs

# remove all files that are ignored by git
deep-clean:
	@make clean
	@rm -rf \
		node_modules packages/*/node_modules \
		dist packages/*/dist \
		.nyc_output \
		npm-debug.log \
		yarn-error.log
	@rm -rf .nyc_output/ npm-debug.log yarn-error.log

# reinstall the node_modules and start with a fresh node build
reinstall:
	@make deep-clean install

# build the source files
build:
	@make clean
	@gulp build

# start the server for the documentation
docs docs-server:
	@docs server

# compile the documentation
docs-build docs-compile:
	@docs compile docs-public

# When watching for changes we can assume it's a development env
# so build files with source maps
watch:
	@make clean
	@gulp watch

# formats and lints all the files
lint:
	@make lint-js lint-json lint-md --jobs

# formats your js code with prettier, then lints them with eslint
lint-js:
	@prettier-eslint 'packages/*/+(src|app|test)/**/*.js' '*.js' --list-different --single-quote --trailing-comma all --parser flow --write
	@eslint --cache 'packages/*/+(src|app|test)/**/*.js' '*.js'

# formats your markdown files with prettier
lint-md:
	@prettier 'packages/*/+(src|app|test)/**/*.md' 'packages/*/*.md' '*.md' --parser markdown --single-quote --trailing-comma all --write

# formats your json files with prettier
lint-json:
	@prettier 'packages/*/+(src|app|test)/**/*.json' 'packages/*/*.json' '*.json' --parser json --write

# run unit tests
test:
	@ava --verbose $(args)

# run coverage for the tests
coverage test-coverage code-coverage:
	# if there's no instance source maps files then build the files with source maps
	@[ -f ./dist/index.js.map ] || (echo "building files with source maps" && make build)
	NODE_ENV="test" nyc --silent -- ava --verbose --no-cache


# These commands only run the report of the code coverage
report-coverage report-code-coverage:
	@if [ -d ./.nyc_output ]; then \
	 	NODE_ENV="test" nyc report; \
	else \
		make test-coverage report-coverage; \
	fi

# posts code coverage to coveralls
post-coverage:
	@if [ -d ./.nyc_output ]; then \
		nyc report --reporter=text-lcov | coveralls; \
	else \
		make test-coverage post-coverage; \
	fi

# The command the ci server runs
ci:
	make lint || exit 1
	# if the tests fail then it will exit with an error
	make coverage || exit 1
	# show the coverage report
	nyc report
	# check check-coverage and if it fails then exit
	nyc check-coverage --statements 95 --functions 95 --lines 95 || exit 1

publish release:
	make reinstall
	make ci || exit 1
	# rebuild project without sourcemaps
	make build
	np --no-cleanup --yolo $(args)

docker-build:
	@docker-compose up -d --build

docker-destroy:
	@docker-compose down -v

docker-down:
	@docker-compose down

docker-rebuild:
	@make docker-destroy docker-build

docker-restart:
	@make docker-down docker-up

docker-up:
	@docker-compose up -d

flow-start:
	@flow

flow-stop:
	@flow stop
