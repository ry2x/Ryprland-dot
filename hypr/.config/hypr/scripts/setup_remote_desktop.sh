#!/usr/bin/env bash
# ┳┓┏┓┳┳┓┏┓┏┳┓┏┓  ┳┓┏┓┏┓┓┏┓┏┳┓┏┓┏┓
# ┣┫┣ ┃┃┃┃┃ ┃ ┣   ┃┃┣ ┗┓┃┫  ┃ ┃┃┃┃
# ┛┗┗┛┛ ┗┗┛ ┻ ┗┛  ┻┛┗┛┗┛┛┗┛ ┻ ┗┛┣┛

# This script sets up a headless output for remote desktop access using Sunshine.
# It creates a virtual output named RMT-1, configures its resolution and refresh rate, and starts the Sunshine service.

hyprctl output create headless RMT-1

sleep 0.2

hyprctl keyword monitor RMT-1,1355x768@60,auto,1

systemctl --user start sunshine
