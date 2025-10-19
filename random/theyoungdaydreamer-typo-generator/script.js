



function generate() {
    const inputText = document.getElementById('inputText').value;
    const config = {
        typoRate: parseFloat(document.getElementById('typoRate').value) / 100,
        deletionProb: parseFloat(document.getElementById('deletionProb').value),
        substitutionProb: parseFloat(document.getElementById('substitutionProb').value),
        duplicationProb: parseFloat(document.getElementById('duplicationProb').value),
        transposeProb: parseFloat(document.getElementById('transposeProb').value),
        neighborDecay: parseFloat(document.getElementById('neighborDecay').value)
    };
    const output = typoize(inputText, config);
    document.getElementById('typo').textContent = output;
}


function mulberry32(a) {
    // seeded RNG for reproducibility (optional)
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function defaultRng() { return Math.random(); }

// keyboard layout with coordinates (approx) to compute distances
const keyboardRows = [
    { y: 0, keys: ['`','1','2','3','4','5','6','7','8','9','0','-','='] },
    { y: 1, keys: ['q','w','e','r','t','y','u','i','o','p','[',']','\\'] },
    { y: 2, keys: ['a','s','d','f','g','h','j','k','l',';','\''] },
    { y: 3, keys: ['z','x','c','v','b','n','m',',','.','/'] },
    // space as a special key:
];

function buildKeyPositions() {
    const pos = new Map();
    for (const row of keyboardRows) {
        const { y, keys } = row;
        for (let i = 0; i < keys.length; i++) {
            // account for horizontal stagger (approx): rows 2 and 3 typically shifted slightly
            const x = i + (y === 2 ? 0.25 : (y === 3 ? 0.5 : 0));
            pos.set(keys[i], { x, y });
        }
    }
    // treat space separately
    pos.set(' ', { x: 5.5, y: 4 });
    return pos;
}

const keyPos = buildKeyPositions();

// returns a map neighbor->distance for a key (includes the key itself with distance 0)
function getNeighborsWithDistance(ch, maxDistance = 3.0) {
    ch = ch.toLowerCase();
    if (!keyPos.has(ch)) return new Map();
    const p = keyPos.get(ch);
    const neighbors = new Map();
    for (const [k, v] of keyPos.entries()) {
        const dx = v.x - p.x, dy = v.y - p.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d <= maxDistance) neighbors.set(k, d);
    }
    return neighbors;
}

// convert neighbor distances into selection weights with exponential decay
function neighborWeights(distMap, decay = 1.5) {
    // weight = exp(-decay * distance); distance 0 (same key) gets highest weight
    const out = [];
    let total = 0;
    for (const [k, d] of distMap.entries()) {
        // a tiny floor so same-key doesn't dominate (we usually don't want substitution->same key,
        // but keeping it allows "no-change" possibility if needed)
        const w = Math.exp(-decay * d);
        out.push({ k, d, w });
        total += w;
    }
    // normalize
    for (const item of out) item.w /= total;
    return out;
}

function pickWeighted(items, rng=Math.random) {
    // items: [{k, w}, ...] normalized or not (we'll treat w as weight)
    let total = 0;
    for (const it of items) total += it.w ?? 0;
    let r = rng() * total;
    for (const it of items) {
        r -= (it.w ?? 0);
        if (r <= 0) return it.k;
    }
    // fallback
    return items.length ? items[items.length-1].k : null;
}

function randomChoice(arr, rng=Math.random) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(rng() * arr.length)];
}

// Main function: typoize a string
// options:
//   typoRate: overall probability per character to attempt a typo (0..1)
//   deletionProb, substitutionProb, duplicationProb, transposeProb: relative chances (sum not required)
//   neighborDecay: how fast neighbor probability decays with distance (higher -> closer keys favored)
//   rngSeed: optional integer seed for deterministic output
function typoize(input, options = {}) {
    const {
        typoRate = 0.12,        // default: 12% of characters will be changed (approx)
        deletionProb = 0.18,
        substitutionProb = 0.5,
        duplicationProb = 0.18,
        transposeProb = 0.14,
        neighborDecay = 1.6,
        maxNeighborDistance = 2.2,
        rngSeed = null,
    } = options;

    const rng = (rngSeed != null) ? mulberry32(rngSeed) : defaultRng;
    // prepare neighbor caches for characters we encounter
    const neighborCache = new Map();

    const chars = Array.from(input); // respects surrogate pairs
    const out = [];
    let i = 0;
    while (i < chars.length) {
        const ch = chars[i];
        const lower = ch.toLowerCase();

        // always allow transposition with previous char as a frequent human typo
        if (out.length > 0 && i < chars.length - 1) {
            // try transpose: swap current and next char
            if (rng() < typoRate * transposeProb) {
                // swap i and i+1
                out.push(chars[i+1]);
                out.push(chars[i]);
                i += 2;
                continue;
            }
        }

        if (rng() < typoRate) {
            // choose which error type to perform based on weights
            const total = deletionProb + substitutionProb + duplicationProb + transposeProb;
            const r = rng() * total;
            if (r < deletionProb) {
                // deletion: skip the character (i.e., letter missing)
                // do nothing (omit ch)
                i += 1;
                continue;
            } else if (r < deletionProb + substitutionProb) {
                // substitution: replace ch with a neighbor key (probability weighted by distance)
                let neighbors = neighborCache.get(lower);
                if (!neighbors) {
                    const distMap = getNeighborsWithDistance(lower, maxNeighborDistance);
                    neighbors = neighborWeights(distMap, neighborDecay);
                    // filter out identical char with tiny probability (we want actual substitution)
                    // but keep it as a small chance so no-op possible
                    neighborCache.set(lower, neighbors);
                }
                if (neighbors.length === 0) {
                    // fallback: just copy
                    out.push(ch);
                } else {
                    // pick neighbor
                    let pick = pickWeighted(neighbors, rng);
                    // maintain case if original was uppercase letter
                    if (isUpperCase(ch)) pick = preserveCase(pick, ch);
                    out.push(pick);
                }
                i += 1;
                continue;
            } else if (r < deletionProb + substitutionProb + duplicationProb) {
                // duplication: duplicate the letter (optionally the duplicate can be slightly wrong)
                // e.g., "l" -> "ll" or "k"->"kk" but sometimes "k"->"kj"
                // push original char
                out.push(ch);
                // for duplicate second char, small chance to be neighbor substitution
                if (rng() < 0.25) {
                    // neighbor duplicate (like hitting adjacent key instead of exact key)
                    let neighbors = neighborCache.get(lower);
                    if (!neighbors) {
                        const distMap = getNeighborsWithDistance(lower, maxNeighborDistance);
                        neighbors = neighborWeights(distMap, neighborDecay);
                        neighborCache.set(lower, neighbors);
                    }
                    const pick = pickWeighted(neighbors, rng);
                    out.push(preserveCase(pick, ch));
                } else {
                    out.push(ch);
                }
                i += 1;
                continue;
            } else {
                // transpose handled above mostly, but as fallback, copy char
                out.push(ch);
                i += 1;
                continue;
            }
        } else {
            // no typo: just copy
            out.push(ch);
            i += 1;
        }
    }

    return out.join('');
}

// helper: check uppercase letter (only A-Z)
function isUpperCase(ch) {
    return ch >= 'A' && ch <= 'Z';
}
function preserveCase(candidate, original) {
    if (!candidate) return candidate;
    return isUpperCase(original) ? candidate.toUpperCase() : candidate;
}

// Example usage:
if (typeof module !== 'undefined' && require && require.main === module) {
    const example = "The quick brown fox jumps over the lazy dog 123!";
    for (let seed = 1; seed <= 5; seed++) {
        console.log(seed, typoize(example, { typoRate: 0.18, rngSeed: seed }));
    }
}

// Export for module usage
if (typeof module !== 'undefined') {
    module.exports = { typoize };
}
