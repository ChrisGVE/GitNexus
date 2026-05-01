#!/bin/bash

source lib/utils.sh

SERVICE_NAME="myapp"

create_user() {
	local name="$1"
	local email="$2"
	log_message "info" "Creating user: $name"
	echo "$name:$email"
}

process_user() {
	local user="$1"
	local formatted
	formatted=$(format_name "$user")
	log_message "info" "Processed: $formatted"
}
