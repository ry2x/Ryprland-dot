#!/bin/bash
# ┳┓┏┓┏┓┏┳┓┏┓┳┓┏┳┓  ┏┓┏┓┏┓
# ┣┫┣ ┗┓ ┃ ┣┫┣┫ ┃ ━━┣┫┃┓┗┓
# ┛┗┗┛┗┛ ┻ ┛┗┛┗ ┻   ┛┗┗┛┗┛

ags quit 2>/dev/null

killall -q ags gjs

sleep 0.1

ags run >/dev/null 2>&1 &
