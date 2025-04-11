#!/usr/bin/env bash

export PUPPETEER_CACHE_DIR=.cache/puppeteer

echo "🛠 Installing dependencies and Chromium..."
npm install
npx puppeteer browsers install chrome
