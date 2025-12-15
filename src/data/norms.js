// Estimated norms based on general literature trends for simple/choice reaction tasks with inhibition.
// Values are mean Reaction Time (ms). Standard deviation is estimated at ~40ms for calculation purposes.

export const NORMS = {
    male: {
        '20s': { mean: 210, sd: 35 },
        '30s': { mean: 225, sd: 40 },
        '40s': { mean: 245, sd: 45 },
        '50s': { mean: 265, sd: 50 },
        '60+': { mean: 290, sd: 60 }
    },
    female: {
        '20s': { mean: 220, sd: 35 }, // Slightly adjusted based on some literature suggesting small diffs
        '30s': { mean: 235, sd: 40 },
        '40s': { mean: 255, sd: 45 },
        '50s': { mean: 275, sd: 50 },
        '60+': { mean: 300, sd: 60 }
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
