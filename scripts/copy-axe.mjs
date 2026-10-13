import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('public', { recursive: true })
copyFileSync('node_modules/axe-core/axe.min.js', 'public/axe.min.js')
console.log('Copied axe.min.js to public/')