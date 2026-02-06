#!/bin/bash

# Quick Start Script - Crypto Dashboard
# Inicia servidor local em 3 formatos diferentes

echo "🚀 Quick Start - Crypto Dashboard"
echo "=================================="
echo ""
echo "Escolha uma opção:"
echo ""
echo "1) Node.js (recomendado)"
echo "2) Python HTTP Server"
echo "3) PHP Built-in Server"
echo ""
read -p "Opção [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "🟢 Iniciando Node.js server..."
        node server.js 8000
        ;;
    2)
        echo ""
        echo "🟢 Iniciando Python HTTP server..."
        echo "URL: http://localhost:8000"
        python3 -m http.server 8000
        ;;
    3)
        echo ""
        echo "🟢 Iniciando PHP built-in server..."
        echo "URL: http://localhost:8000"
        php -S localhost:8000
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac