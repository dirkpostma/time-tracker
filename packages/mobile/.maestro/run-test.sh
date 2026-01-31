#!/bin/bash
# Helper script to run Maestro tests with Expo Dev Client
# Reconnects the app to Metro before running the test

set -e

TEST_FILE="${1:-entry_detail_flow.yaml}"
METRO_URL="${METRO_URL:-http://localhost:8081}"

echo "🔄 Reconnecting app to Metro..."
xcrun simctl openurl booted "exp+time-tracker://expo-development-client/?url=$(echo $METRO_URL | sed 's/:/%3A/g; s/\//%2F/g')"

echo "⏳ Waiting for app to connect..."
sleep 5

echo "🧪 Running test: $TEST_FILE"
JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
$JAVA_HOME/bin/java -classpath "$HOME/.maestro/lib/*" maestro.cli.AppKt test "$TEST_FILE"
