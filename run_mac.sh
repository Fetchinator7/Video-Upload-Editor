#!/bin/sh
MY_PATH=`dirname "$0"`
MY_PATH=`( cd "$MY_PATH" && pwd )`
cd "$MY_PATH" && open npm_run_server_mac.sh
cd "$MY_PATH" && npm run client
