#!/bin/bash

_POST_DATA_PATH=./post_data.sh

post_data() {
	$_POST_DATA_PATH "$1" "$2"
}

post_data users '{ "userName": "Nick" }'
post_data users '{ "userName": "Zach" }'
post_data users '{ "userName": "Michiel" }'
post_data users '{ "userName": "Patrick" }'
post_data users '{ "userName": "Julia" }'
