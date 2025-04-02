#!/bin/bash

# Ép Cloudflare dùng npm thay vì bun
echo "⚙️ Dùng npm install thay vì bun..."
npm install

# Build project như thường
echo "🏗️ Đang build project..."
npm run build
