#!/bin/bash

for port in {3000..3010}; do
  pid=$(lsof -ti tcp:$port)
  if [ ! -z "$pid" ]; then
    echo "Killing process using port $port (PID: $pid)"
    kill -9 $pid
  fi
done