#!/bin/bash

API="http://localhost:4741"
URL_PATH="/sign-up"
EMAIL="stepanei@gmail.com"
PASSWORD="password"



curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --data '{
    "credentials": {
      "email": "'"${EMAIL}"'",
      "password": "'"${PASSWORD}"'",
      "password_confirmation": "'"${PASSWORD}"'"
    }
  }'

echo
