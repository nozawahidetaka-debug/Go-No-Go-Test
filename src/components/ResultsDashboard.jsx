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

    // Calculate reaction time statistics (Go trials only)
    const goTrials = results.filter(r => r.type === 'GO' && r.correct && (r.reactionTime !== null && r.reactionTime !== undefined));
    const reactionTimes = goTrials.map(r => r.reactionTime).sort((a, b) => a - b);

    // Median reaction time
    const medianReactionTime = reactionTimes.length > 0
        ? Math.round(reactionTimes.length % 2 === 0
            ? (reactionTimes[reactionTimes.length / 2 - 1] + reactionTimes[reactionTimes.length / 2]) / 2
            : reactionTimes[Math.floor(reactionTimes.length / 2)])
        : 0;

    // Interquartile range (IQR) - Q1 and Q3
    const q1Index = Math.floor(reactionTimes.length * 0.25);
    const q3Index = Math.floor(reactionTimes.length * 0.75);
    const q1 = reactionTimes.length > 0 ? Math.round(reactionTimes[q1Index]) : 0;
    const q3 = reactionTimes.length > 0 ? Math.round(reactionTimes[q3Index]) : 0;

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
                        {medianReactionTime}ms
                    </div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        ({q1}-{q3}ms)
                    </div>
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
