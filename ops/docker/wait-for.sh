#!/bin/sh

# wait-for.sh - Wait for a service to be available

TIMEOUT=15
QUIET=0

usage() {
    cat << USAGE >&2
Usage:
    $0 host:port [-t timeout] [-- command args]
    -q | --quiet                        Do not output any status messages
    -t TIMEOUT | --timeout=timeout      Timeout in seconds, zero for no timeout
    -- COMMAND ARGS                     Execute command with args after the test finishes
USAGE
    exit 1
}

wait_for() {
    if [ "$QUIET" -ne 1 ]; then echo "Waiting for $HOST:$PORT..."; fi
    for i in $(seq $TIMEOUT); do
        nc -z "$HOST" "$PORT" > /dev/null 2>&1
        result=$?
        if [ $result -eq 0 ]; then
            if [ "$QUIET" -ne 1 ]; then echo "$HOST:$PORT is available after $i seconds"; fi
            return 0
        fi
        sleep 1
    done
    echo "Operation timed out" >&2
    return 1
}

while [ $# -gt 0 ]; do
    case "$1" in
        *:* )
        hostport=(${1//:/ })
        HOST=${hostport[0]}
        PORT=${hostport[1]}
        shift 1
        ;;
        --quiet|-q)
        QUIET=1
        shift 1
        ;;
        --timeout)
        TIMEOUT="$2"
        if [ "$TIMEOUT" = "" ]; then break; fi
        shift 2
        ;;
        --timeout=*)
        TIMEOUT="${1#*=}"
        shift 1
        ;;
        --)
        shift
        CLI=("$@")
        break
        ;;
        --help)
        usage
        ;;
        *)
        echo "Unknown argument: $1"
        usage
        ;;
    esac
done

if [ "$HOST" = "" ] || [ "$PORT" = "" ]; then
    echo "Error: you need to provide a host and port to test."
    usage
fi

wait_for "$@"

if [ -n "${CLI[*]}" ]; then
    exec "${CLI[@]}"
fi
