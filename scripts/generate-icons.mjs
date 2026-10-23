#!/usr/bin/env node
// Script para gerar ícones PWA a partir do SVG
// Rode: node scripts/generate-icons.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const publicDir = resolve(__dirname, '../public');
const faviconPath = resolve(publicDir, 'favicon.svg');

async function generateIcons() {
  try {
    // Verificar se sharp está disponível
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch {
      console.log('📦 Instalando sharp para gerar ícones...');
      const { execSync } = await import('child_process');
      execSync('npm install sharp --save-dev', { stdio: 'inherit', cwd: resolve(__dirname, '..') });
      sharp = (await import('sharp')).default;
    }

    const svgBuffer = readFileSync(faviconPath);

    // Gerar ícones PWA
    const sizes = [
      { size: 192, name: 'pwa-192x192.png' },
      { size: 512, name: 'pwa-512x512.png' },
      { size: 180, name: 'apple-touch-icon.png' }
    ];

    for (const { size, name } of sizes) {
      const outputPath = resolve(publicDir, name);
      await sharp(svgBuffer, { density: 300 })
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`✅ Gerado: ${name} (${size}x${size})`);
    }

    // Gerar favicon.ico (16, 32, 48)
    const icoPath = resolve(publicDir, 'favicon.ico');
    await sharp(svgBuffer, { density: 300 })
      .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(icoPath);
    console.log(`✅ Gerado: favicon.ico`);

    console.log('\n🎉 Todos os ícones gerados com sucesso!');
    console.log('Agora rode: npm run dev');

  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    console.log('\n📝 Alternativa manual:');
    console.log('1. Abra https://realfavicongenerator.net/');
    console.log('2. Faça upload do public/favicon.svg');
    console.log('3. Baixe o pacote e extraia em public/');
    process.exit(1);
  }
}

generateIcons();