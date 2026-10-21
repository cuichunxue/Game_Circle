import {build} from 'esbuild';import fs from 'node:fs';
fs.mkdirSync('dist',{recursive:true});await build({entryPoints:['src/app.tsx'],bundle:true,minify:true,sourcemap:false,outdir:'dist',entryNames:'app',target:['safari15'],loader:{'.json':'json'}});fs.copyFileSync('src/index.html','dist/index.html');fs.copyFileSync('src/sw.js','dist/sw.js');fs.copyFileSync('src/icon.svg','dist/icon.svg');
