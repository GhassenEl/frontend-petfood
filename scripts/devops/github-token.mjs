#!/usr/bin/env node
/**
 * Récupère un token GitHub pour les scripts DevOps.
 * Priorité : GH_TOKEN / GITHUB_TOKEN / GITHUB_PAT → git credential fill
 */
import { spawnSync } from 'node:child_process';

export function resolveGithubToken() {
  for (const key of ['GH_TOKEN', 'GITHUB_TOKEN', 'GITHUB_PAT']) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  const result = spawnSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
    windowsHide: true,
  });

  if (result.status !== 0) return null;

  const line = result.stdout
    .split('\n')
    .find((row) => row.startsWith('password='));
  return line ? line.slice('password='.length).trim() : null;
}

export async function ghCli(args, { repo = 'GhassenEl/frontend-petfood' } = {}) {
  const token = resolveGithubToken();
  if (!token) throw new Error('Token GitHub introuvable (GH_TOKEN ou git credential)');

  const result = spawnSync(
    'gh',
    [...args, '-R', repo],
    {
      encoding: 'utf8',
      windowsHide: true,
      env: { ...process.env, GH_TOKEN: token },
    },
  );

  if (result.status !== 0) {
    const msg = (result.stderr || result.stdout || '').trim();
    throw new Error(msg || `gh ${args.join(' ')} a échoué`);
  }
  return (result.stdout || '').trim();
}

export async function setRepoSecret(name, value, repo = 'GhassenEl/frontend-petfood') {
  await ghCli(['secret', 'set', name, '--body', value], { repo });
  return name;
}

export async function listRepoSecrets(repo = 'GhassenEl/frontend-petfood') {
  const out = await ghCli(['secret', 'list'], { repo });
  if (!out) return [];
  return out.split('\n').map((line) => line.split('\t')[0]).filter(Boolean);
}
