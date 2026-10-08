#!/usr/bin/env bash
# Deletes previous Allure data, runs the tests, then generates a new report.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

echo "Deleting previous Allure results and report..."
rm -rf "${root}/allure-results" "${root}/allure-report"

echo "Running tests to collect new Allure results..."
npm test

echo "Generating a new Allure report..."
npx allure generate "${root}/allure-results" --clean -o "${root}/allure-report"

echo "Allure report written to allure-report/"
