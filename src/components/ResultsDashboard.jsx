import React, { useMemo } from 'react';
import { evaluatePerformance } from '../data/norms';

const ResultsDashboard = ({ results, userInfo, onRestart }) => {
    if (!results) return <div>No Results Data</div>;

    // Calculate No-Go inhibition success rate
    const nogoTrials = results.filter(r => r.type === 'NOGO');
    const nogoSuccess = nogoTrials.filter(r => r.correct).length;
    const inhibitionRate = nogoTrials.length > 0
        ? Math.round((nogoSuccess / nogoTrials.length) * 100)
        : 0;

    // Advanced Evaluation Logic: 3-Step Filtering
    const processedData = useMemo(() => {
        if (!results || !userInfo) return { median: null, q1: null, q3: null };

        // 0. Initial Filter: Go trials, correct, valid reaction time
        let validTrials = results.filter(r => r.type === 'GO' && r.correct && r.reactionTime !== null);

        // 1. Anticipatory Response Removal (< 120ms)
        validTrials = validTrials.filter(r => r.reactionTime >= 120);

        // 2. Age-based Cutoff
        const age = parseInt(userInfo.age, 10);
        let cutoff = 1200; // Default (<= 49)
        if (age >= 70) cutoff = 1800;
        else if (age >= 50) cutoff = 1500;

        validTrials = validTrials.filter(r => r.reactionTime < cutoff);

        if (validTrials.length === 0) return { median: null, q1: null, q3: null };

        // Helper to calc median/quartiles
        const calcStats = (trials) => {
            const sorted = trials.map(r => r.reactionTime).sort((a, b) => a - b);
            const len = sorted.length;
            if (len === 0) return { median: null, q1: null, q3: null, iqr: null };

            const median = len % 2 === 0
                ? (sorted[len / 2 - 1] + sorted[len / 2]) / 2
                : sorted[Math.floor(len / 2)];

            const q1 = sorted[Math.floor(len * 0.25)];
            const q3 = sorted[Math.floor(len * 0.75)];
            const iqr = q3 - q1;

            return { median, q1, q3, iqr };
        };

        const stats = calcStats(validTrials);
        if (!stats.median) return { median: null, q1: null, q3: null };

        // 3. Statistical Outlier Removal (Median ± 3*IQR)
        // Only apply if we have enough data to calculate IQR reasonably? 
        // Logic requests straight application.
        const lowerBound = stats.median - (3 * stats.iqr);
        const upperBound = stats.median + (3 * stats.iqr);

        validTrials = validTrials.filter(r => r.reactionTime >= lowerBound && r.reactionTime <= upperBound);

        // Final Calculation
        if (validTrials.length === 0) return { median: null, q1: null, q3: null };
        const finalStats = calcStats(validTrials);

        return {
            median: finalStats.median ? Math.round(finalStats.median) : null,
            q1: finalStats.q1 ? Math.round(finalStats.q1) : null,
            q3: finalStats.q3 ? Math.round(finalStats.q3) : null
        };

    }, [results, userInfo]);

    const { median: medianReactionTime, q1, q3 } = processedData;

    // Demographic Evaluation
    const evaluation = useMemo(() => {
        if (medianReactionTime > 0 && userInfo) {
            return evaluatePerformance(userInfo.age, userInfo.sex, medianReactionTime);
        }
        return null;
    }, [medianReactionTime, userInfo]);

    const downloadCSV = () => {
        // Define CSV headers
        const headers = ['ラウンド', 'タイプ', 'アクション', '反応時間(ms)', '正解'];

        // Map results to rows
        const rows = results.map(r => [
            r.round,
            r.type,
            r.action,
            r.reactionTime ? Math.round(r.reactionTime) : '',
            r.correct ? 'TRUE' : 'FALSE'
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `go_nogo_results_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px' }}>
            <h1>結果</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '2rem 0' }}>
                <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>反応時間</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--accent-go)' }}>
                        {medianReactionTime ? `${medianReactionTime}ms` : '---'}
                    </div>
                    {medianReactionTime && (
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            ({q1}-{q3}ms)
                        </div>
                    )}
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Go刺激への反応
                    </div>
                </div>
                <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>抑制成功率</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--accent-ui)' }}>{inhibitionRate}%</div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        No-Go: {nogoSuccess}/{nogoTrials.length}成功
                    </div>
                </div>
            </div>

            {evaluation && (
                <div className="glass-panel" style={{ margin: '0 auto 2rem auto', background: 'rgba(107, 76, 255, 0.1)', borderColor: 'var(--accent-ui)', width: '100%' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>パフォーマンス ({userInfo.sex === 'male' ? '男性' : '女性'}、{userInfo.age}歳)</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: evaluation.rating.includes('Good') || evaluation.rating.includes('Excellent') ? 'var(--accent-go)' : '#fff', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                        {evaluation.rating}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '1rem' }}>
                        あなたの年齢層の平均: <strong style={{ color: '#fff' }}>{evaluation.mean}ms</strong>
                        <br />
                        差分: <span style={{ color: evaluation.diff <= 0 ? 'var(--accent-go)' : 'var(--accent-nogo)' }}>
                            {evaluation.diff > 0 ? '+' : ''}{Math.round(evaluation.diff)}ms
                        </span>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={onRestart}>もう一度</button>
                <button onClick={downloadCSV} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--accent-ui)' }}>
                    CSVダウンロード
                </button>
            </div>
        </div>
    );
};

export default ResultsDashboard;
