// Revised norms based on large-scale reaction time studies (e.g., Der & Deary, 2006; Woods et al., 2015).
// Simple Reaction Time (SRT) is typically ~250ms for young adults.
// Go/No-Go tasks involve inhibition/discrimination, adding ~50-100ms processing cost.
// Values below represent "Simple Visual Go/No-Go" estimates: ~330ms baseline for young adults, increasing with age.

export const NORMS = {
    male: {
        '20s': { mean: 320, sd: 45 },
        '30s': { mean: 340, sd: 50 },
        '40s': { mean: 370, sd: 55 },
        '50s': { mean: 400, sd: 60 },
        '60+': { mean: 440, sd: 70 }
    },
    female: {
        '20s': { mean: 340, sd: 45 },
        '30s': { mean: 360, sd: 50 },
        '40s': { mean: 390, sd: 55 },
        '50s': { mean: 420, sd: 60 },
        '60+': { mean: 460, sd: 70 }
    }
};

export const evaluatePerformance = (age, sex, reactionTime) => {
    if (!age || !sex || !reactionTime) return null;

    // Map age to category
    let ageCat = '60+';
    const ageNum = parseInt(age, 10);
    if (ageNum < 30) ageCat = '20s';
    else if (ageNum < 40) ageCat = '30s';
    else if (ageNum < 50) ageCat = '40s';
    else if (ageNum < 60) ageCat = '50s';

    const group = NORMS[sex] ? NORMS[sex][ageCat] : NORMS['male']['20s']; // Fallback
    const { mean, sd } = group;

    const zScore = (reactionTime - mean) / sd;

    // Lower RT is better, so negative zScore is "faster" (Good)
    let rating = 'Average';
    if (zScore < -1.5) rating = 'Excellent'; // Much faster
    else if (zScore < -0.5) rating = 'Good'; // Faster
    else if (zScore > 1.5) rating = 'Needs Improvement'; // Much slower
    else if (zScore > 0.5) rating = 'Below Average'; // Slower

    return {
        rating,
        mean,
        diff: reactionTime - mean
    };
};
