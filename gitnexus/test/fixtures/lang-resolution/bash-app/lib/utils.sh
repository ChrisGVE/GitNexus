#!/bin/bash

LOG_LEVEL="info"

log_message() {
	local level="$1"
	local msg="$2"
	echo "[$level] $msg"
}

format_name() {
	local name="$1"
	echo "${name^^}"
}
