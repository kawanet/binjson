#!/usr/bin/env bash -c make

all: node_modules src/index.js

clean:
	/bin/rm -f src/*.js test/*.js

test: all mocha

node_modules:
	npm install

src/%.js: src/%.ts
	./node_modules/.bin/tsc -p .

test/%.js: test/%.ts
	./node_modules/.bin/tsc -p .

mocha: test/100.primitive.js
	./node_modules/.bin/mocha test

.PHONY: all clean test
