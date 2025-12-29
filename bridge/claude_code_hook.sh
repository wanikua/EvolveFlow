#!/bin/bash
# Claude Code Hook - Captures terminal output and sends to bridge
# Usage: ./claude_code_hook.sh [command to run]

BRIDGE_URL="http://localhost:8001/api/events/capture"
LOG_FILE="/tmp/claude_code_session.log"

echo "Starting Claude Code session capture..."
echo "Bridge URL: $BRIDGE_URL"
echo "Log file: $LOG_FILE"

# Create log file
touch "$LOG_FILE"

# Function to send event to bridge
send_event() {
    local event_type=$1
    local content=$2
    local tool_name=$3

    if [ -n "$tool_name" ]; then
        curl -s -X POST "$BRIDGE_URL" \
            -H "Content-Type: application/json" \
            -d "{\"event_type\": \"$event_type\", \"content\": \"$content\", \"metadata\": {\"tool_name\": \"$tool_name\"}}" \
            > /dev/null 2>&1
    else
        curl -s -X POST "$BRIDGE_URL" \
            -H "Content-Type: application/json" \
            -d "{\"event_type\": \"$event_type\", \"content\": \"$content\"}" \
            > /dev/null 2>&1
    fi
}

# Function to parse and send log lines
process_log_line() {
    local line=$1

    # Detect tool calls
    if echo "$line" | grep -q '<invoke name='; then
        tool_name=$(echo "$line" | sed -n 's/.*<invoke name="\([^"]*\)".*/\1/p')
        send_event "tool_call" "Calling tool: $tool_name" "$tool_name"
        echo "[BRIDGE] Tool call: $tool_name"
    fi

    # Detect reasoning patterns
    if echo "$line" | grep -Eq "Let me|I will|I need to|First,|Now"; then
        send_event "thought" "$line"
        echo "[BRIDGE] Thought: $line"
    fi

    # Detect tool results
    if echo "$line" | grep -q '<function_results>'; then
        send_event "tool_result" "Tool execution completed"
        echo "[BRIDGE] Tool result captured"
    fi
}

# Monitor log file in background
tail -f "$LOG_FILE" | while read -r line; do
    process_log_line "$line"
done &

TAIL_PID=$!

# Run the command and tee to log file
if [ $# -gt 0 ]; then
    "$@" 2>&1 | tee -a "$LOG_FILE"
else
    echo "No command specified. Monitoring existing log file..."
    wait $TAIL_PID
fi

# Cleanup
kill $TAIL_PID 2>/dev/null

echo "Session capture complete"
