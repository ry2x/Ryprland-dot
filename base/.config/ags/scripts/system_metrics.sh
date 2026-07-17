#!/bin/bash
# System Metrics Output in JSON

# CPU Usage
CPU=$(top -bn1 | awk '/Cpu\(s\)/ {print $2 + $4}')

# RAM Usage
read -r used total <<< $(free -m | awk '/Mem:/ {print $3, $2}')
if [ -z "$total" ] || [ "$total" -eq 0 ]; then
  RAM_JSON='{"used":0, "total":0, "percent":0}'
else
  used_gb=$(awk "BEGIN {print $used / 1024}")
  total_gb=$(awk "BEGIN {print $total / 1024}")
  percent=$(awk "BEGIN {print $used / $total}")
  RAM_JSON="{\"used\":$used_gb, \"total\":$total_gb, \"percent\":$percent}"
fi

# GPU Usage
GPU=$(cat /sys/class/drm/card*/device/gpu_busy_percent 2>/dev/null | sort -nr | head -n 1)
if [ -z "$GPU" ]; then GPU=0; fi

# Uptime
UPTIME=$(uptime -p 2>/dev/null)
if [ -z "$UPTIME" ]; then UPTIME="up 0 mins"; fi

# Output as JSON
echo "{\"cpu\": ${CPU:-0}, \"ram\": $RAM_JSON, \"gpu\": $GPU, \"uptime\": \"$UPTIME\"}"
