#!/bin/bash

_HOST=localhost
_PORT=3000

post_data() {
	curl -X POST http://${_HOST}:${_PORT}/$1 -H "content-type: application/json" --data "$2"
	echo
}

post_data "$1" "$2"
