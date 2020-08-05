#!/bin/sh
MY_PATH=`dirname "$0"`
MY_PATH=`( cd "$MY_PATH" && pwd )`
cd "$MY_PATH" && /usr/local/bin/npm run server