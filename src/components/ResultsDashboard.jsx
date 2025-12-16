import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { evaluatePerformance } from '../data/norms';

const ResultsDashboard = ({ results, userInfo, onRestart }) => {
    if (!results) return null;

    const total = results.length;
    const correct = results.filter(r => r.correct).length;
    const accuracy = Math.round((correct / total) * 100);

    const goTrials = results.filter(r => r.type === 'GO' && r.correct && r.reactionTime);
    const reactionTimes = goTrials.map(r => r.reactionTime).sort((a, b) => a - b);

    const medianReactionTime = reactionTimes.length > 0
        ? (reactionTimes.length % 2 === 0
            ? Math.round((reactionTimes[reactionTimes.length / 2 - 1] + reactionTimes[reactionTimes.length / 2]) / 2)
            : reactionTimes[Math.floor(reactionTimes.length / 2)])
        : 0;

    // Demographic Evaluation
    const evaluation = useMemo(() => {
        if (medianReactionTime > 0 && userInfo) {
            return evaluatePerformance(userInfo.age, userInfo.sex, medianReactionTime);
        }
        return null;
    }, [medianReactionTime, userInfo]);

    // Calculate Box Plot Data
    let boxPlotData = [];
    if (reactionTimes.length >= 5) {
        const min = Math.min(...reactionTimes);
        const max = Math.max(...reactionTimes);
        const q1 = reactionTimes[Math.floor(reactionTimes.length * 0.25)];
        const median = reactionTimes[Math.floor(reactionTimes.length * 0.5)];
        const q3 = reactionTimes[Math.floor(reactionTimes.length * 0.75)];

        boxPlotData = [
            {
                x: 'Reaction Time',
                y: [min, q1, median, q3, max].map(Math.round)
            }
        ];
    }

    const chartOptions = {
        chart: {
            type: 'boxPlot',
            height: 350,
            background: 'transparent',
            toolbar: { show: false }
        },
        title: {
            text: 'Reaction Time Distribution (Correct Go)',
            align: 'left',
            style: { color: 'var(--text-secondary)' }
        },
        plotOptions: {
            boxPlot: {
                colors: {
                    upper: 'var(--accent-go)',
                    lower: 'var(--accent-ui)'
                }
            }
        },
        xaxis: {
            labels: { style: { colors: 'var(--text-secondary)' } }
        },
        yaxis: {
            labels: { style: { colors: 'var(--text-secondary)' } }
        },
        theme: { mode: 'dark' },
        grid: { show: false },
        stroke: {
            colors: ['#ffffff'] // White for max contrast
        }
    };

    const downloadCSV = () => {
        // Define CSV headers
        const headers = ['Round', 'Type', 'Action', 'ReactionTime(ms)', 'Correct'];

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
            <h1>Results</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '2rem 0' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Accuracy</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-ui)' }}>{accuracy}%</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Median Reaction</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-go)' }}>{medianReactionTime}ms</div>
                </div>
            </div>

            {evaluation && (
                <div className="glass-panel" style={{ margin: '0 auto 2rem auto', background: 'rgba(107, 76, 255, 0.1)', borderColor: 'var(--accent-ui)', width: '100%' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Performance ({userInfo.sex === 'male' ? 'Male' : 'Female'}, {userInfo.age}s)</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: evaluation.rating.includes('Good') || evaluation.rating.includes('Excellent') ? 'var(--accent-go)' : '#fff', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                        {evaluation.rating}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '1rem' }}>
                        Avg for your group: <strong style={{ color: '#fff' }}>{evaluation.mean}ms</strong>
                        <br />
                        Difference: <span style={{ color: evaluation.diff <= 0 ? 'var(--accent-go)' : 'var(--accent-nogo)' }}>
                            {evaluation.diff > 0 ? '+' : ''}{Math.round(evaluation.diff)}ms
                        </span>
                    </div>
                </div>
            )}

            {boxPlotData.length > 0 && (
                <div style={{ margin: '2rem 0', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px' }}>
                    <Chart options={chartOptions} series={[{ type: 'boxPlot', data: boxPlotData }]} type="boxPlot" height={350} />
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={onRestart}>Try Again</button>
                <button onClick={downloadCSV} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--accent-ui)' }}>
                    Download CSV
                </button>
            </div>
        </div>
    );
};

export default ResultsDashboard;
