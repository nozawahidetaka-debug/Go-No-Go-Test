import React, { useState } from 'react';
import LandingPage from './LandingPage';
import GameScreen from './GameScreen';
import ResultsDashboard from './ResultsDashboard';

const GAME_STATES = {
    LANDING: 'LANDING',
    PLAYING: 'PLAYING',
    RESULTS: 'RESULTS'
};

const GameContainer = () => {
    const [gameState, setGameState] = useState(GAME_STATES.LANDING);
    const [lastResults, setLastResults] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const startGame = (info) => {
        setUserInfo(info);
        setGameState(GAME_STATES.PLAYING);
    };

    const endGame = (results) => {
        setLastResults(results);
        setGameState(GAME_STATES.RESULTS);
    };

    const resetGame = () => {
        setLastResults(null);
        setGameState(GAME_STATES.LANDING);
    };

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {gameState === GAME_STATES.LANDING && (
                <LandingPage onStart={startGame} />
            )}
            {gameState === GAME_STATES.PLAYING && (
                <GameScreen onEnd={endGame} />
            )}
            {gameState === GAME_STATES.RESULTS && (
                <ResultsDashboard results={lastResults} userInfo={userInfo} onRestart={resetGame} />
            )}
        </div>
    );
};

export default GameContainer;
