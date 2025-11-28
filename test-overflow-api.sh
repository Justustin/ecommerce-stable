#!/bin/bash

# ============================================================================
# Group Buying Overflow Logic - API Test Script
# ============================================================================
# This script tests the overflow check endpoints with curl
# Prerequisites: Services must be running (pnpm dev)
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service URLs
WAREHOUSE_URL="${WAREHOUSE_SERVICE_URL:-http://localhost:3003}"
GROUP_BUYING_URL="${GROUP_BUYING_SERVICE_URL:-http://localhost:3002}"

# Function to print section header
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if required IDs are provided
if [ -z "$1" ]; then
    echo ""
    print_error "Usage: $0 <product_id> [variant_s_id] [variant_m_id] [variant_l_id]"
    echo ""
    print_info "Get these IDs by running: psql \$DATABASE_URL -f setup-test-data.sql"
    echo ""
    print_info "Example:"
    echo "  $0 123e4567-e89b-12d3-a456-426614174000 \\"
    echo "     123e4567-e89b-12d3-a456-426614174001 \\"
    echo "     123e4567-e89b-12d3-a456-426614174002 \\"
    echo "     123e4567-e89b-12d3-a456-426614174003"
    echo ""
    exit 1
fi

PRODUCT_ID=$1
VARIANT_S_ID=${2:-}
VARIANT_M_ID=${3:-}
VARIANT_L_ID=${4:-}

# Check if services are running
print_header "🔍 Checking Services"

if curl -s -f "${WAREHOUSE_URL}/health" > /dev/null 2>&1 || curl -s "${WAREHOUSE_URL}" > /dev/null 2>&1; then
    print_success "Warehouse service is running at ${WAREHOUSE_URL}"
else
    print_error "Warehouse service is NOT running at ${WAREHOUSE_URL}"
    print_warning "Start services with: pnpm dev"
    exit 1
fi

if curl -s -f "${GROUP_BUYING_URL}/health" > /dev/null 2>&1 || curl -s "${GROUP_BUYING_URL}" > /dev/null 2>&1; then
    print_success "Group buying service is running at ${GROUP_BUYING_URL}"
else
    print_warning "Group buying service might not be running at ${GROUP_BUYING_URL}"
fi

# Test 1: Check All Variants Endpoint
print_header "TEST 1: Check All Variants (Frontend UX)"

print_info "Testing: GET /api/warehouse/check-all-variants?productId=${PRODUCT_ID}"
echo ""

RESPONSE=$(curl -s -X GET "${WAREHOUSE_URL}/api/warehouse/check-all-variants?productId=${PRODUCT_ID}")

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    print_success "Endpoint responded successfully"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.'

    echo ""
    print_info "Variant Status Summary:"

    # Parse and display each variant status
    VARIANT_COUNT=$(echo "$RESPONSE" | jq '.data.variants | length')
    for ((i=0; i<$VARIANT_COUNT; i++)); do
        VARIANT_NAME=$(echo "$RESPONSE" | jq -r ".data.variants[$i].variantName")
        IS_LOCKED=$(echo "$RESPONSE" | jq -r ".data.variants[$i].isLocked")
        REASON=$(echo "$RESPONSE" | jq -r ".data.variants[$i].reason")

        if [ "$IS_LOCKED" == "true" ]; then
            echo -e "  ${RED}🔒 ${VARIANT_NAME}${NC}: ${REASON}"
        else
            echo -e "  ${GREEN}✅ ${VARIANT_NAME}${NC}: ${REASON}"
        fi
    done
else
    print_error "Endpoint failed"
    echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
fi

# Test 2: Individual Variant Checks
if [ -n "$VARIANT_S_ID" ] && [ -n "$VARIANT_M_ID" ] && [ -n "$VARIANT_L_ID" ]; then
    print_header "TEST 2: Individual Variant Overflow Checks"

    print_info "Expected behavior:"
    echo "  S=8, M=0, L=8 (max=8 each), bundle=4S+4M+4L"
    echo "  • Small: Has stock → UNLOCKED ✅"
    echo "  • Medium: Bundle would overflow S,L → LOCKED 🔒"
    echo "  • Large: Has stock → UNLOCKED ✅"
    echo ""

    # Test Small
    print_info "Testing Small variant..."
    RESPONSE_S=$(curl -s -X GET "${WAREHOUSE_URL}/api/warehouse/check-bundle-overflow?productId=${PRODUCT_ID}&variantId=${VARIANT_S_ID}")
    IS_LOCKED_S=$(echo "$RESPONSE_S" | jq -r '.data.isLocked')

    if [ "$IS_LOCKED_S" == "false" ]; then
        print_success "Small is UNLOCKED (as expected)"
        echo "$RESPONSE_S" | jq '.data'
    else
        print_error "Small is LOCKED (unexpected!)"
        echo "$RESPONSE_S" | jq '.data'
    fi
    echo ""

    # Test Medium
    print_info "Testing Medium variant..."
    RESPONSE_M=$(curl -s -X GET "${WAREHOUSE_URL}/api/warehouse/check-bundle-overflow?productId=${PRODUCT_ID}&variantId=${VARIANT_M_ID}")
    IS_LOCKED_M=$(echo "$RESPONSE_M" | jq -r '.data.isLocked')

    if [ "$IS_LOCKED_M" == "true" ]; then
        print_success "Medium is LOCKED (as expected)"
        echo "$RESPONSE_M" | jq '.data'
    else
        print_error "Medium is UNLOCKED (unexpected!)"
        echo "$RESPONSE_M" | jq '.data'
    fi
    echo ""

    # Test Large
    print_info "Testing Large variant..."
    RESPONSE_L=$(curl -s -X GET "${WAREHOUSE_URL}/api/warehouse/check-bundle-overflow?productId=${PRODUCT_ID}&variantId=${VARIANT_L_ID}")
    IS_LOCKED_L=$(echo "$RESPONSE_L" | jq -r '.data.isLocked')

    if [ "$IS_LOCKED_L" == "false" ]; then
        print_success "Large is UNLOCKED (as expected)"
        echo "$RESPONSE_L" | jq '.data'
    else
        print_error "Large is LOCKED (unexpected!)"
        echo "$RESPONSE_L" | jq '.data'
    fi
    echo ""

    # Summary
    print_header "📊 Test Results"

    TESTS_PASSED=0
    TESTS_FAILED=0

    if [ "$IS_LOCKED_S" == "false" ]; then
        print_success "Small (unlocked): PASS"
        ((TESTS_PASSED++))
    else
        print_error "Small (unlocked): FAIL"
        ((TESTS_FAILED++))
    fi

    if [ "$IS_LOCKED_M" == "true" ]; then
        print_success "Medium (locked): PASS"
        ((TESTS_PASSED++))
    else
        print_error "Medium (locked): FAIL"
        ((TESTS_FAILED++))
    fi

    if [ "$IS_LOCKED_L" == "false" ]; then
        print_success "Large (unlocked): PASS"
        ((TESTS_PASSED++))
    else
        print_error "Large (unlocked): FAIL"
        ((TESTS_FAILED++))
    fi

    echo ""
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "ALL TESTS PASSED! (${TESTS_PASSED}/3)"
    else
        print_error "SOME TESTS FAILED (${TESTS_PASSED}/${TESTS_PASSED} + ${TESTS_FAILED} passed)"
    fi
    echo ""
else
    print_warning "Skipping individual variant checks (variant IDs not provided)"
    echo ""
    print_info "To run full tests, provide all variant IDs:"
    echo "  $0 <product_id> <variant_s_id> <variant_m_id> <variant_l_id>"
    echo ""
fi

print_header "✓ Testing Complete"
