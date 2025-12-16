import React, { useState, useEffect, useRef, useCallback } from 'react';

// Configuration
const TOTAL_ROUNDS = 20;
const MIN_INTERVAL = 1500; // ms
const MAX_INTERVAL = 3000; // ms
const GO_PROBABILITY = 0.7; // 70% Go, 30% No-Go

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
            // Decide logic
            const isGo = Math.random() < GO_PROBABILITY;
            const type = isGo ? STIMULUS.GO : STIMULUS.NOGO;

            setStimulusType(type);
            setIsStimulusVisible(true);
            setWaitingForInput(true);
            // Time recorded in useEffect after render
            setCurrentRound(p => p + 1);

        }, delay);

    }, []); // Minimal dependencies

    // Measure time exactly when stimulus renders
    useEffect(() => {
        if (isStimulusVisible) {
            stimulusTimeRef.current = performance.now();
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
            // Wait window
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
            }, 1500); // 1.5s response window
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
                Round {currentRound} / {TOTAL_ROUNDS}
            </h2>

            <div
                style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: stimulusType?.shape || '50%',
                    backgroundColor: isStimulusVisible ? stimulusType.color : 'transparent',

                    boxShadow: isStimulusVisible ? `0 0 50px ${stimulusType.color}` : 'none',
                    cursor: 'pointer'
                }}
                onMouseDown={(e) => { e.preventDefault(); handleInput(); }} // Mouse support
            />

            {!isStimulusVisible && (
                <div style={{ marginTop: '2rem', height: '2rem', color: 'var(--text-secondary)' }}>Wait...</div>
            )}

            <div style={{ position: 'absolute', bottom: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Press SPACE or Click the Shape
            </div>
        </div>
    );
};

export default GameScreen;
