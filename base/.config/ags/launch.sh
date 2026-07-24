#!/bin/bash

# Get the directory where this script is located
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

# Check if start-ags exists
if [ ! -f "start-ags" ]; then
    echo "start-ags not found. Bundling AGS entrypoint..."
    ags bundle app.ts start-ags
fi

# Execute start-ags with any passed arguments
exec ./start-ags "$@"
