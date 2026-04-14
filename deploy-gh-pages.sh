#!/bin/bash

# Script de Deploy Automático para GitHub Pages
# Este script sincroniza o branch main com o gh-pages

set -e

echo "🚀 Iniciando deploy para GitHub Pages..."

# 1. Fazer build do projeto
echo "📦 Compilando projeto..."
cd client
npm run build > /dev/null 2>&1
cd ..

# 2. Salvar branch atual
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 3. Fazer checkout do gh-pages
echo "🔄 Sincronizando com branch gh-pages..."
git checkout gh-pages

# 4. Remover arquivos antigos
rm -rf !(node_modules|.git|.gitignore|package.json|package-lock.json|pnpm-lock.yaml)

# 5. Copiar arquivos compilados
cp -r dist/public/* .

# 6. Fazer commit e push
git add .
git commit -m "Deploy: Sincronizado com main ($(date '+%Y-%m-%d %H:%M:%S'))" || echo "Nenhuma mudança para fazer commit"
git push origin gh-pages

# 7. Voltar ao branch original
git checkout $CURRENT_BRANCH

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Site atualizado em: https://campusalmenara-ui.github.io/siteunimontes/"
