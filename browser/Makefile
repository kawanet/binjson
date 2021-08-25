#!/usr/bin/env bash -c make

all: ../dist/binjson.min.js ../build/test.js

clean:
	/bin/rm -fr ../dist/binjson.min.js ../build/

test: all

../build/test.js: ../test/[0-8]*.js
	../node_modules/.bin/browserify -o $@ $^ \
		-t [ browserify-sed 's#require\("../"\)#require("../browser/import")#' ]

../dist/binjson.min.js: ../build/binjson.bundle.js
	mkdir -p ../dist/
	../node_modules/.bin/terser -c -m -o $@ $<

../build/binjson.bundle.js: ../build/binjson.amd.js wrap.js
	grep -v "// END" wrap.js > $@
	cat $< >> $@
	grep "// END" wrap.js >> $@
	perl -i -pe 's#^ *("use strict"|Object.defineProperty.*"__esModule"|(exports.* =)+ void 0)#// $$&#mg' $@

../build/binjson.amd.js: ../src/*.ts
	../node_modules/.bin/tsc -p ../browser

.PHONY: all clean test
