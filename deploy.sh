#!/bin/bash

# Deploy Script - Crypto Dashboard to GitHub Pages
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy do Crypto Dashboard..."

# Verificação de pré-requisitos
check_prerequisites() {
    echo "📋 Verificando pré-requisitos..."

    # Verificar git
    if ! command -v git &> /dev/null; then
        echo "❌ Git não instalado"
        exit 1
    fi

    # Verificar se está em um repo git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "📦 Inicializando repositório git..."
        git init
        git add .
        git commit -m "Initial commit - Crypto Dashboard"
    fi

    echo "✅ Pré-requisitos OK"
}

# Configurar repositório remoto
setup_remote() {
    echo "🔗 Configurando repositório remoto..."

    if [ -z "$GITHUB_USERNAME" ]; then
        echo "Informe seu usuário GitHub:"
        read -r GITHUB_USERNAME
    fi

    if [ -z "$REPO_NAME" ]; then
        echo "Nome do repositório (ex: crypto-dashboard):"
        read -r REPO_NAME
    fi

    REPO_URL="git@github.com:${GITHUB_USERNAME}/${REPO_NAME}.git"

    # Verificar se remote já existe
    if ! git remote get-url origin > /dev/null 2>&1; then
        echo "Criando remote origin..."
        git remote add origin "$REPO_URL"
    else
        echo "Remote origin já existe"
    fi

    echo "✅ Remote pronto"
}

# Criar repositório no GitHub
create_github_repo() {
    echo "📝 Criando repositório no GitHub..."

    if command -v gh &> /dev/null; then
        # Usar gh CLI se disponível
        gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
        echo "✅ Repositório criado via gh CLI"
    else
        echo "⚠️  gh CLI não instalado"
        echo "Crie o repositório manualmente:"
        echo "1. Vá para https://github.com/new"
        echo "2. Nome: $REPO_NAME"
        echo "3. Público"
        echo "4. Clique em 'Create repository'"
        echo "5. Depois rode: git push -u origin main"

        read -p "Após criar, pressione Enter para continuar..."
    fi
}

# Configurar GitHub Pages
setup_pages() {
    echo "🌐 Configurando GitHub Pages..."

    if command -v gh &> /dev/null; then
        gh api \
          --method POST \
          -H "Accept: application/vnd.github+json" \
          "/repos/${GITHUB_USERNAME}/${REPO_NAME}/pages" \
          -f build_type='legacy' \
          -f source[branch]=main \
          -f source[folder]=/

        echo "⏳ GitHub Pages ativando... (pode levar 1-2 minutos)"

        # Aguardar ativação
        echo "Verificando status..."
        for i in {1..10}; do
            sleep 10
            STATUS=$(gh api "/repos/${GITHUB_USERNAME}/${REPO_NAME}/pages" --jq '.status')
            echo "Status: $STATUS"
            if [ "$STATUS" = "built" ]; then
                echo "✅ GitHub Pages ativo!"
                break
            fi
        done

        # Obter URL
        URL=$(gh api "/repos/${GITHUB_USERNAME}/${REPO_NAME}/pages" --jq '.html_url')
        echo "🌍 URL: $URL"

    else
        echo "⚠️  Configure manualmente:"
        echo "1. Vá para Settings > Pages"
        echo "2. Source: Deploy from a branch"
        echo "3. Branch: main, folder: /(root)"
        echo "4. Save"
    fi
}

# Deploy principal
deploy() {
    echo "🚀 Fazendo deploy..."

    # Adicionar arquivos
    git add .

    # Commit
    COMMIT_MSG="Update dashboard - $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG" || echo "Nada para commitar"

    # Push
    git push -u origin main || {
        echo "⚠️  Erro no push. Atualize config:"
        git branch -M main
        git push -u origin main
    }

    echo "✅ Deploy concluído!"
}

# Atualizações futuras
update_dashboard() {
    echo "📝 Para atualizações futuras:"
    echo "1. Edite os arquivos (index.html, style.css, script.js, data.json)"
    echo "2. Rode: git add . && git commit -m 'Atualização' && git push"
    echo "3. GitHub Pages atualiza automaticamente"
}

# Principal
main() {
    check_prerequisites
    setup_remote

    echo ""
    echo "Escolha uma opção:"
    echo "1) Criar novo repositório (primeira vez)"
    echo "2) Deploy em repositório existente"
    echo "3) Apenas ativar GitHub Pages"
    read -p "Opção: " choice

    case $choice in
        1)
            create_github_repo
            setup_pages
            deploy
            ;;
        2)
            deploy
            ;;
        3)
            setup_pages
            ;;
        *)
            echo "Opção inválida"
            exit 1
            ;;
    esac

    echo ""
    echo "🎉 Deploy concluído!"
    update_dashboard
}

main