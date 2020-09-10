#!/bin/bash
MY_PATH=`dirname "$0"`
MY_PATH=`( cd "$MY_PATH" && pwd )`
cd "$MY_PATH" && open run_scripts/run_start.sh
cd "$MY_PATH" && open run_scripts/run_server.sh
