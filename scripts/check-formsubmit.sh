#!/usr/bin/env bash
# Pingt den FormSubmit-AJAX-Endpoint und gibt den HTTP-Status aus.
# Exit 0 wenn 200, sonst 1. Nutzbar als manueller Check oder in Cron/CI.
#
#   ./scripts/check-formsubmit.sh           # einmaliger Check
#   watch -n 300 ./scripts/check-formsubmit.sh   # alle 5 Min

set -u

EMAIL="marco.arpa@outlook.de"
URL="https://formsubmit.co/ajax/${EMAIL}"
TS=$(date '+%Y-%m-%d %H:%M:%S')

# Minimaler Probe-POST. _captcha=false unterdrückt Captcha-Antwort.
RESPONSE=$(curl -s -o /dev/null --max-time 25 \
  -w '%{http_code}|%{time_total}' \
  -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"_subject":"healthcheck (bitte ignorieren)","_captcha":"false","ping":"1"}')

CODE="${RESPONSE%%|*}"
TIME="${RESPONSE##*|}"

if [ "$CODE" = "200" ]; then
  echo "[$TS] OK   — FormSubmit antwortet (200, ${TIME}s)"
  exit 0
else
  echo "[$TS] DOWN — HTTP $CODE nach ${TIME}s (Endpoint: $URL)"
  exit 1
fi
