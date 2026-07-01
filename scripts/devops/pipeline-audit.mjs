#!/usr/bin/env node
/**
 * Audit local du pipeline DevOps PetfoodTN.
 * Usage: npm run devops:pipeline
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PIPELINE_STAGES } from '../../src/config/devopsPipelineCatalog.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const REQUIRED = [
  '.github/workflows/platform-pipeline.yml',
  '.github/workflows/ci.yml',
  '.github/workflows/security.yml',
  '.github/workflows/publish-ecr.yml',
  '.github/workflows/deploy-aws.yml',
  '.github/workflows/deployment-readiness.yml',
  'infra/terraform/aws/main.tf',
  'docs/DEVOPS-PIPELINE.md',
];

console.log('\n🔧 PetfoodTN — audit pipeline DevOps\n');

let ok = 0;
let fail = 0;

for (const rel of REQUIRED) {
  const exists = fs.existsSync(path.join(ROOT, rel));
  if (exists) {
    console.log(`  ✅ ${rel}`);
    ok += 1;
  } else {
    console.log(`  ❌ ${rel} — manquant`);
    fail += 1;
  }
}

console.log('\n📋 Étapes configurées :\n');
for (const s of PIPELINE_STAGES) {
  console.log(`  ${s.order}. ${s.label} → ${s.workflow}`);
}

console.log(`\n${ok} fichiers OK · ${fail} manquant(s)\n`);
if (fail > 0) process.exit(1);

console.log('✅ Pipeline prêt — push main déclenche platform-pipeline.yml\n');
