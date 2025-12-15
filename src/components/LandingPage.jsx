import React from 'react';

const LandingPage = ({ onStart }) => {
    const [age, setAge] = React.useState('');
    const [sex, setSex] = React.useState('');

    const handleStart = () => {
        if (!age || !sex) {
            alert('Please select your Age and Sex to start.');
            return;
        }
        // Simple validation
        if (age < 0 || age > 120) {
            alert('Please enter a valid age.');
            return;
        }
        onStart({ age, sex });
    };

    return (
        <div className="glass-panel">
            <h1>Go / No-Go Test</h1>
            <p style={{ margin: '1rem 0', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Measure your reaction time and inhibition control.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1rem 0' }}>
                <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '5px', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                >
                    <option value="">Select Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <input
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{ width: '80px', padding: '0.5rem', borderRadius: '5px', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--glass-border)' }}
                />
            </div>

            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '10px', margin: '2rem 0' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Instructions:</h3>
                <ul style={{ listStylePosition: 'inside', color: 'var(--text-secondary)' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Press <strong>SPACE</strong> whenever you see the <span style={{ color: 'var(--accent-go)' }}>Green Circle</span>.</li>
                    <li>Do <strong>NOT</strong> press anything when you see the <span style={{ color: 'var(--accent-nogo)' }}>Red Square</span>.</li>
                </ul>
            </div>

            <button onClick={handleStart}>Start Test</button>
        </div>
    );
};

export default LandingPage;
