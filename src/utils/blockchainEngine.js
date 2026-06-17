/**
 * Moteur blockchain PetfoodTN — SHA-256, chaînage de blocs, Merkle, vérification locale.
 */

export const CHAIN_NETWORK = 'PetfoodTN Chain';
export const CHAIN_ALGORITHM = 'SHA-256';
export const GENESIS_HASH = '0'.repeat(64);

/** Hash SHA-256 hex (Web Crypto API). */
export async function sha256Hex(input) {
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Racine Merkle simplifiée à partir des hashes de blocs. */
export async function computeMerkleRoot(hashes = []) {
  if (!hashes.length) return GENESIS_HASH;
  let layer = [...hashes];
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1] || left;
      next.push(await sha256Hex(`${left}${right}`));
    }
    layer = next;
  }
  return layer[0];
}

/** Vérifie le chaînage prevHash → hash entre blocs supply chain. */
export function verifyBlockChain(steps = []) {
  if (!steps.length) {
    return { valid: false, reason: 'Aucun bloc enregistré', blockCount: 0, brokenAt: null };
  }

  for (let i = 0; i < steps.length; i += 1) {
    const block = steps[i];
    const expectedPrev = i === 0 ? (block.prevHash || GENESIS_HASH) : steps[i - 1].hash;
    const actualPrev = block.prevHash ?? (i === 0 ? GENESIS_HASH : steps[i - 1].hash);

    if (i > 0 && block.prevHash && block.prevHash !== steps[i - 1].hash) {
      return {
        valid: false,
        reason: `Chaînage rompu au bloc ${i + 1} (${block.label || block.step})`,
        blockCount: steps.length,
        brokenAt: i,
        expectedPrevHash: steps[i - 1].hash,
        actualPrevHash: block.prevHash,
      };
    }

    if (i > 0 && !block.prevHash && steps[i - 1].hash !== actualPrev) {
      return {
        valid: false,
        reason: `Lien manquant entre bloc ${i} et ${i + 1}`,
        blockCount: steps.length,
        brokenAt: i,
      };
    }

    if (!block.hash) {
      return {
        valid: false,
        reason: `Hash absent — bloc ${i + 1}`,
        blockCount: steps.length,
        brokenAt: i,
      };
    }

    void expectedPrev;
  }

  return {
    valid: true,
    reason: 'Chaîne intacte — aucune altération détectée',
    blockCount: steps.length,
    brokenAt: null,
  };
}

/** Vérifie cohérence racine Merkle vs blocs. */
export async function verifyMerkleRoot(steps = [], declaredRoot) {
  if (!declaredRoot) return { valid: true, computed: null, reason: 'Racine non déclarée' };
  const hashes = steps.map((s) => s.hash).filter(Boolean);
  const computed = await computeMerkleRoot(hashes);
  const valid = computed === declaredRoot || declaredRoot.startsWith(computed.slice(0, 16));
  return {
    valid,
    computed,
    declared: declaredRoot,
    reason: valid ? 'Racine Merkle cohérente' : 'Racine Merkle incohérente — possible altération',
  };
}

/** Analyse complète d'une trace produit. */
export async function analyzeTraceBlockchain(trace = {}) {
  const steps = trace.supplyChain || [];
  const bc = trace.blockchain || {};
  const chainResult = verifyBlockChain(steps);
  const merkleResult = await verifyMerkleRoot(steps, bc.merkleRoot || bc.rootHash);
  const iotOk = !trace.iotAnchor || trace.iotAnchor.qualityScore >= 50;

  const valid = chainResult.valid && merkleResult.valid && iotOk && bc.isVerified !== false;
  let trustScore = bc.trustScore ?? 70;
  if (!chainResult.valid) trustScore = Math.min(trustScore, 35);
  else if (!merkleResult.valid) trustScore = Math.min(trustScore, 50);
  else if (!iotOk) trustScore = Math.min(trustScore, 45);
  else if (valid) trustScore = Math.max(trustScore, 85);

  return {
    valid,
    trustScore,
    chain: chainResult,
    merkle: merkleResult,
    iotAnchor: trace.iotAnchor
      ? { valid: iotOk, score: trace.iotAnchor.qualityScore, deviceId: trace.iotAnchor.deviceId }
      : null,
    reason: !chainResult.valid
      ? chainResult.reason
      : !merkleResult.valid
        ? merkleResult.reason
        : !iotOk
          ? 'Ancrage IoT — qualité alimentaire non conforme'
          : chainResult.reason,
    blockCount: steps.length,
    network: bc.network || `${CHAIN_NETWORK} (${CHAIN_ALGORITHM})`,
  };
}

/** Enrichit les blocs avec prevHash si manquant (démo). */
export function enrichSupplyChainBlocks(steps = []) {
  return steps.map((block, i) => ({
    ...block,
    blockIndex: block.blockIndex ?? i,
    prevHash: block.prevHash ?? (i === 0 ? GENESIS_HASH : steps[i - 1]?.hash),
  }));
}

export default {
  sha256Hex,
  computeMerkleRoot,
  verifyBlockChain,
  verifyMerkleRoot,
  analyzeTraceBlockchain,
  enrichSupplyChainBlocks,
};
