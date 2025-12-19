import React, { useState, useEffect, useRef, useCallback } from 'react';

// Configuration
const TOTAL_ROUNDS = 20;
const MIN_INTERVAL = 1500; // ms
const MAX_INTERVAL = 3000; // ms
const GO_PROBABILITY = 0.7; // 70% Go, 30% No-Go
const NOGO_DISPLAY_TIME = 800; // ms - Time to display No-Go stimulus before moving to next round

// Generate balanced sequence of Go/No-Go stimuli using Fisher-Yates shuffle
const generateStimulusSequence = (totalRounds, goProbability) => {
    const goCount = Math.round(totalRounds * goProbability);
    const nogoCount = totalRounds - goCount;

    // Create array with exact counts
    const sequence = [
        ...Array(goCount).fill('GO'),
        ...Array(nogoCount).fill('NOGO')
    ];

    // Fisher-Yates shuffle for unbiased randomization
    for (let i = sequence.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }

    return sequence;
};

const GameScreen = ({ onEnd }) => {
    const [currentRound, setCurrentRound] = useState(0);
    const [isStimulusVisible, setIsStimulusVisible] = useState(false);
    const [stimulusType, setStimulusType] = useState(null); // 'GO' or 'NOGO'
    const [results, setResults] = useState([]);
    const [waitingForInput, setWaitingForInput] = useState(false);

    // Refs for Event Listener access (to avoid stale closures)
    const waitingForInputRef = useRef(waitingForInput);
    const stimulusTypeRef = useRef(stimulusType);
    const currentRoundRef = useRef(currentRound);
    const stimulusTimeRef = useRef(0);
    const timeoutRef = useRef(null);

    // Generate balanced stimulus sequence once at the start
    const stimulusSequenceRef = useRef(generateStimulusSequence(TOTAL_ROUNDS, GO_PROBABILITY));

    // Sync state to refs
    useEffect(() => {
        waitingForInputRef.current = waitingForInput;
        stimulusTypeRef.current = stimulusType;
        currentRoundRef.current = currentRound;
    }, [waitingForInput, stimulusType, currentRound]);

    // Stimulus Types
    const STIMULUS = {
        GO: { type: 'GO', color: 'var(--accent-go)', shape: '50%' }, // Circle
        NOGO: { type: 'NOGO', color: 'var(--accent-nogo)', shape: '10%' } // Square
    };

    // Watch for game completion
    useEffect(() => {
        if (results.length >= TOTAL_ROUNDS) {
            onEnd(results);
        }
    }, [results, onEnd]);

    const nextRound = useCallback(() => {
        const round = currentRoundRef.current;
        if (round >= TOTAL_ROUNDS) {
            return;
        }

        setIsStimulusVisible(false);
        setWaitingForInput(false);

        // Random delay before showing stimulus
        const delay = Math.random() * (MAX_INTERVAL - MIN_INTERVAL) + MIN_INTERVAL;

        timeoutRef.current = setTimeout(() => {
            // Use pre-generated balanced sequence instead of random
            const stimulusTypeName = stimulusSequenceRef.current[round];
            const type = stimulusTypeName === 'GO' ? STIMULUS.GO : STIMULUS.NOGO;

            setStimulusType(type);
            setIsStimulusVisible(true);
            setWaitingForInput(true);
            // Time recorded in useEffect after render
            setCurrentRound(p => p + 1);

        }, delay);

    }, []); // Minimal dependencies

    // Measure time exactly when stimulus renders
    // Use requestAnimationFrame to ensure timing is captured AFTER the browser paints
    useEffect(() => {
        if (isStimulusVisible) {
            // Wait for the next animation frame (after paint) to record the time
            requestAnimationFrame(() => {
                stimulusTimeRef.current = performance.now();
            });
        }
    }, [isStimulusVisible]);

    const handleInput = useCallback(() => {
        if (!waitingForInputRef.current) return;

        const reactionTime = performance.now() - stimulusTimeRef.current;
        const currentStimulus = stimulusTypeRef.current;
        const isCorrect = currentStimulus.type === 'GO';

        // Record Result
        setResults(prev => [...prev, {
            round: currentRoundRef.current,
            type: currentStimulus.type,
            action: 'PRESS',
            reactionTime,
            correct: isCorrect
        }]);

        setWaitingForInput(false);
        setIsStimulusVisible(false);

        // Trigger next round
        nextRound();

    }, [nextRound]);

    // Handle "No input" for No-Go (auto-success after a timeout)
    useEffect(() => {
        let noInputTimeout;
        if (waitingForInput && stimulusType) {
            // Wait window - shorter for No-Go to reduce perceived delay
            noInputTimeout = setTimeout(() => {
                if (waitingForInputRef.current) {
                    // Time expired without input
                    const currentStimulus = stimulusTypeRef.current;
                    const isCorrect = currentStimulus.type === 'NOGO'; // Correct if NOGO logic

                    setResults(prev => [...prev, {
                        round: currentRoundRef.current,
                        type: currentStimulus.type,
                        action: 'TIMEOUT',
                        reactionTime: null,
                        correct: isCorrect
                    }]);

                    setWaitingForInput(false);
                    setIsStimulusVisible(false);
                    nextRound();
                }
            }, NOGO_DISPLAY_TIME); // Reduced from 1500ms to 800ms for better flow
        }
        return () => clearTimeout(noInputTimeout);
    }, [waitingForInput, stimulusType, nextRound]);


    useEffect(() => {
        const handleKeyDown = (e) => {
            // Support Space and Enter? Or just Space.
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault(); // Prevent scrolling
                console.log('Space pressed'); // Debug log
                handleInput();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleInput]);

    // Start first round on mount
    useEffect(() => {
        const initTimer = setTimeout(nextRound, 1000);
        return () => clearTimeout(initTimer);
    }, []); // Runs once on mount

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ position: 'absolute', top: '20px', fontSize: '1.5rem', opacity: 0.5 }}>
                ラウンド {currentRound} / {TOTAL_ROUNDS}
            </h2>

            <div
                style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: stimulusType?.shape || '50%',
                    backgroundColor: isStimulusVisible ? stimulusType.color : 'transparent',
                    boxShadow: isStimulusVisible ? `0 0 50px ${stimulusType.color}` : 'none',
                    cursor: 'pointer',
                    // Performance optimizations for mobile devices
                    willChange: 'background-color, box-shadow',
                    transform: 'translateZ(0)', // Force GPU acceleration
                    transition: 'none' // Disable transitions for instant display
                }}
                onTouchStart={(e) => {
                    e.preventDefault();
                    handleInput();
                }} // Touch support (faster on mobile)
                onMouseDown={(e) => {
                    e.preventDefault();
                    handleInput();
                }} // Mouse support (desktop)
            />

            {!isStimulusVisible && (
                <div style={{ marginTop: '2rem', height: '2rem', color: 'var(--text-secondary)' }}>待機中...</div>
            )}

            <div style={{ position: 'absolute', bottom: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                スペースキーを押すか図形をクリック
            </div>
        </div>
    );
};

export default GameScreen;
