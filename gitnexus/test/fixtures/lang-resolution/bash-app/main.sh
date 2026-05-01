#!/bin/bash

source lib/service.sh

main() {
	local user
	user=$(create_user "Alice" "alice@example.com")
	process_user "$user"
}

main "$@"
