#!/usr/bin/env bash -c make

ALL=\
	example.json \
	sample-large.json \
	citylots.json.gz \

all: $(ALL)

example.json:
	curl -o $@ https://raw.githubusercontent.com/kawanet/msgpack-lite/master/test/example.json

sample-large.json:
	curl -o $@ https://raw.githubusercontent.com/msgpack/msgpack-javascript/main/benchmark/sample-large.json

# content-encoding: gzip
citylots.json.gz:
	curl -o $@ --compressed --raw https://raw.githubusercontent.com/zemirco/sf-city-lots-json/master/citylots.json

clean:
	/bin/rm -f $(ALL)
