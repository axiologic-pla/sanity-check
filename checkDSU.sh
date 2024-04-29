#!/bin/bash

# This script is used to run the checkDSU Node.js script with a domain path and optionally a fix flag

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 <domainPath> [-f]"
  exit 1
fi

# Set the domain path from the first argument
DOMAIN_PATH=$1

# Check if the second argument is the fix flag
FIX_FLAG=""
if [ "$2" == "-f" ]; then
  FIX_FLAG="-f"
fi

# Run the Node.js script with the provided arguments
node checkDSU.js $DOMAIN_PATH $FIX_FLAG
