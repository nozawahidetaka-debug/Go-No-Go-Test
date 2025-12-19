import React from 'react';

const LandingPage = ({ onStart }) => {
    const [age, setAge] = React.useState('');
    const [sex, setSex] = React.useState('');

    const handleStart = () => {
        if (!age || !sex) {
            alert('年齢と性別を選択してください。');
            return;
        }
        // Simple validation
        if (age < 0 || age > 120) {
            alert('有効な年齢を入力してください。');
            return;
        }
        onStart({ age, sex });
    };

    return (
        <div className="glass-panel">
            <h1>Go / No-Go テスト</h1>
            <p style={{ margin: '1rem 0', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                反応時間と抑制制御を測定します。
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1rem 0' }}>
                <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '5px', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                >
                    <option value="">性別を選択</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                </select>
                <input
                    type="number"
                    placeholder="年齢"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{ width: '80px', padding: '0.5rem', borderRadius: '5px', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--glass-border)' }}
                />
            </div>

            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '10px', margin: '2rem 0' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>説明:</h3>
                <ul style={{ listStylePosition: 'inside', color: 'var(--text-secondary)' }}>
                    <li style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--accent-go)' }}>緑色の円</span>が表示されたら<strong>スペースキー</strong>を押してください。</li>
                    <li><span style={{ color: 'var(--accent-nogo)' }}>赤色の四角</span>が表示されたら何も押さないでください。</li>
                </ul>
            </div>

            <button onClick={handleStart}>テスト開始</button>
        </div>
    );
};

export default LandingPage;
