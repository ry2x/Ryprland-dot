#!/bin/bash

TIME=$1

while true; do
    sleep "$TIME" # Change wallpaper every specified interval (in seconds)
    waypaper --random
done
