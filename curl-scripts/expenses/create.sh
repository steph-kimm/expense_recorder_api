#!/bin/bash

API="http://localhost:4741"
URL_PATH="/expenses"
TOKEN="a1fa822b77b63996eebdca90699186f8"
TEXT="i am text"
AMOUNT="100"
TITLE="i am title"
DATE="2023-01-25"
curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "expense": {
      "text": "'"${TEXT}"'",
      "amount": "'"${AMOUNT}"'",
      "title": "'"${TITLE}"'",
      "date": "'"${DATE}"'"
    }
  }'

echo
