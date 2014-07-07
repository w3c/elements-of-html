

all: json
.PHONY: all

json: elements.json
.PHONY: json

elements.json: index.html node_modules/jsdom/package.json
	bin/create_json.js

node_modules/jsdom/package.json:
	npm install
