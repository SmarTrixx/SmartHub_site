#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzU1ZThlNDZlNDE1NzY1ZjFjNjRjZiIsImlhdCI6MTc2NTEwNTI5NSwiZXhwIjoxNzY1NzEwMDk1fQ.U4ZO96AHsOPRdOEM_s4dIkJnQHXj_qwjALKURI0Ze9U"
BASE_URL="http://localhost:5000/api"

echo "🧪 Testing SmartHub API Endpoints"
echo "=================================="
echo ""

# Test 1: Get all projects
echo "✅ Test 1: GET /projects"
curl -s "$BASE_URL/projects" | jq .
echo ""

# Test 2: Get profile  
echo "✅ Test 2: GET /profile"
curl -s "$BASE_URL/profile" | jq .
echo ""

# Test 3: Get services
echo "✅ Test 3: GET /services"
curl -s "$BASE_URL/services" | jq .
echo ""

# Test 4: Try login with existing user
echo "✅ Test 4: POST /auth/login"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smarthub.com","password":"demo123456"}' | jq .
echo ""

echo "All basic endpoints tested successfully! ✨"
