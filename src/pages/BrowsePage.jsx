import { useEffect, useState, useRef } from "react";

import { getSoundscapes, getAudioUrl, getSoundscape } from '../services/soundscapeService';
import { createSession, updateSession } from '../services/sessionService';
import { getFavorites, addFavorite, removeFavorite } from "../services/favoriteService";
import { getFrequency } from '../services/frequencyService';

const BrowsePage = () => {
    const [soundscapes, setSoundscapes] = useState([]);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedFrequency, setSelectedFrequency]= useState(null);
    const [timerMode, setTimerMode] = useState(false);
    const [timerDuration, setTimerDuration] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null)
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    const sourceRef = useRef(null);

// Audio Player State
const [currentTrack, setCurrentTrack] = useState(null); 
const [isPlaying, setIsPlaying] = useState(false); 
const [currentTime, setCurrentTime] = useState(0); 
const [volume, setVolume] = useState(0.75); 
const [duration, setDuration] = useState(0); 
const [sessionId, setSessionId] = useState(null); 

const audioRef = useRef(new Audio())
// Fetch Soundscapes
useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            const soundscapeData = await getSoundscapes(category || null);
            const favoriteData = await getFavorites()
            setSoundscapes(soundscapeData);
            setFavorites(favoriteData.map(f => f.id))
        } catch (err) {
            setError('Failed to load soundscapes');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, [category]);

// Audio event listners
useEffect(() => {
    const audio = audioRef.current;

    audio.crossOrigin = "anonymous";

    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended = () => handleStop();

    return () => {
        audio.pause();
        audio.src = '';
    };
}, []);

useEffect(() => {
    if (!timerMode || !timerDuration || !isPlaying) return;

    const remaining = timerDuration - currentTime;
    setTimeRemaining(remaining);

    if (remaining <= 0) {
        // Play chime
        const chime = new Audio('/chime-cords.mp3');
        chime.volume = 0.5;
        chime.play();

        // Stop playback after chime
        setTimeout(() => {
            handleStop();
            setTimerMode(false);
            setTimerDuration(null)
            setTimeRemaining(null);
        }, 2000);
    }
}, [currentTime, timerMode, timerDuration, isPlaying]);

// Handlers - Play soundscape
const handlePlay = async (soundscape) => {
    const audio = audioRef.current;
    // if same track, toggle play/pause
    if (currentTrack?.id === soundscape.id) {
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
            setIsPlaying(true);
        }
        return;
    }
    // Stop current track
    if (currentTrack) {
        await handleStop();
    }

    // Start new track
    setCurrentTrack(soundscape);
    audio.src = getAudioUrl(soundscape.file_name);
    audio.volume = volume;
    audio.loop = true;

    // Create session
    try {
        const session = await createSession(soundscape.id, volume);
        setSessionId(session.id);
    } catch (err) {
        console.log('Failed to create session:', err);
    }
    audio.play();
    setIsPlaying(true);

// Add Media Session (lock screen controls)
if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
        title: soundscape.name,
        artist: `${soundscape.frequency_hz}Hz • vybeReazen`,
        album: soundscape.category,
    });

    navigator.mediaSession.setActionHandler('play', () => {
        audio.play();
        setIsPlaying(true);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
        audio.play();
        setIsPlaying(false);
    });

    navigator.mediaSession.setActionHandler('stop', () => {
        handleStop()
    });    
 }  

    if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }
    startVisualizer();

};

// stop playback
const handleStop = async () => {
    const audio = audioRef.current;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);

    // Stop Visualizer
    stopVisualizer();

    // Update Session
    if (sessionId) {
        try {
            await updateSession(sessionId, {
                ended_at: new Date().toISOString(),
                duration_actual: Math.floor(currentTime),
                completed: currentTime >= duration * 0.9
            });
        } catch (err) {
            console.log('Failed to update session:', err);
        }
        setSessionId(null);
    }

    setCurrentTrack(null);
    setCurrentTime(0);
};

// Volume change
const handleVolumeChange = (e) => {
    const newVolume = Math.min(parseFloat(e.target.value), 0.9);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
};
//  Seek
const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
};
const handleSetTimer = (minutes) => {
    if (minutes === null) {
        setTimerMode(false);
        setTimerDuration(null);
        setTimeRemaining(null);
    } else {
        setTimerMode(true);
        setTimerDuration(minutes * 60);
        setTimeRemaining(minutes * 60);

    }
};

// Visualizer Functions
const startVisualizer = () => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    // Create audio context only once
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        animationRef.current = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2

            // Gradient colors matching theme
            const gradient =ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight);
            gradient.addColorStop(0, '#ff00ff');
            gradient.addColorStop(0.5, '#ff6b00');
            gradient.addColorStop(1, '#ffd700');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    };

    draw();
};

const stopVisualizer = () => {
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
    }
};

const handleToggleFavorite = async (soundscapeId) => {
    const isFavorited = favorites.includes(soundscapeId);

    try{
        if (isFavorited) {
            await removeFavorite(soundscapeId);
            setFavorites(favorites.filter(id => id !== soundscapeId));
        } else {
            await addFavorite(soundscapeId);
            setFavorites([...favorites, soundscapeId]);
        }    
    } catch (err) {
        console.log('Failed to update favorite:', err);
    }
};

const handleFrequencyClick = async (hz) => {
    try {
        const frequencyData = await getFrequency(hz);
        setSelectedFrequency(frequencyData);
        setShowModal(true);
    } catch (err){
        console.log('Failed to load fruency:', err);
    }
};

const closeModal = () => {
    setShowModal(false);
    setSelectedFrequency(null);
};

// Format Time
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

if (loading) return <main><p>Loading soundscapes...</p></main>;
if (error) return <main><p>{error}</p></main>;

return (
    <main>
        <h1>Browse Soundscapes</h1>
        <p>Find you healing frequency</p>

        {/* Category Filter */}
        <section className='category-filter'>
            <button onClick={() => setCategory('')} className={category === '' ? 'active' : ''}>
                All
            </button>
            <button onClick={() => setCategory('meditation')} className={category === 'meditation' ? 'active' : ''}>
                Meditation
            </button>
            <button onClick={() => setCategory('sound_bath')} className={category === 'sound_bath' ? 'active' : ''}>
                Sound Bath
            </button>
            <button onClick={() => setCategory('massage')} className={category === 'massage' ? 'active' : ''}>
                Massage
            </button>
        </section>

        {/* Soundscape List */}
        <section>
            {soundscapes.length > 0 ? (
              soundscapes.map((soundscape) => (
                <div key={soundscape.id} className={`soundscape-card ${currentTrack?.id === soundscape.id ? 'playing' : ''}`}>
                    <h3>🎵 {soundscape.name}</h3>
                    <button
                        className={`favorite-btn  ${favorites.includes(soundscape.id) ? 'favorited' : ''}`}
                        onClick={() => handleToggleFavorite(soundscape.id)}
                        >
                            {favorites.includes(soundscape.id) ? '❤️' : '🤍'}
                        </button>
                    <p>{soundscape.description}</p>
                    <div className='card-meta'>
                        <span>{soundscape.category}</span>
                        <span>{soundscape.genre}</span>
                        <span className="frequency-badge"
                            onClick={() => handleFrequencyClick(soundscape.frequency_hz)}
                            style={{ cursor: 'pointer' }}
                        >
                            {soundscape.frequency_hz}Hz        
                            </span>
                    </div>
                    <div className="card-footer">
                        <span>{Math.floor(soundscape.duration_seconds / 60)} min</span>
                    <button 
                      className={currentTrack?.id === soundscape.id && isPlaying ? 'gold' : ''} onClick={() => handlePlay(soundscape)}>
                        {currentTrack?.id === soundscape.id && isPlaying ? '▶︎ Now Playing' : '▶︎ Play'}
                    </button>
                </div>
               </div> 
              ))
            ) : (
                <p>No soundscapes found.</p>  
            )}
        </section>

        {/* Audio Player */}
            <section className='audio-player'>
                <canvas ref={canvasRef} className="visualizer" width="800" height="100"></canvas>
               <div className="audio-player-content">
                {currentTrack ? (
                  <>
                    <div className="track-info">
                        <h4>🎵 {currentTrack.name}</h4>
                        <span>{currentTrack.genre} • {currentTrack.frequency_hz}Hz</span>
                    </div>

                <div className="controls">
                    <button onClick={() => handlePlay(currentTrack)}>
                        {isPlaying ? '⏸' : '▶︎'}
                    </button>
                    <button onClick={handleStop}>◼︎</button>
                </div>

                <div className="progress-container">
                    <span>{formatTime(currentTime)}</span>
                    <input
                        type='range'
                        min='0'
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                      />
                      <span>{formatTime(duration)}</span>  
                </div>

                {/* Volume */}
                <div className="volume-container">
                    <span>🔈</span>
                    <input
                    type='range'
                    min='0'
                    max='0.9'
                    step='0.01'
                    value={volume}
                    onChange={handleVolumeChange}
                    />
                    <span>🔊</span>
                </div>

                {/* Timer */}
                <div className="timer-container">
                    {timerMode && timeRemaining > 0 ? (
                        <div className="timer-display">
                            <span className="timer-remaining">{formatTime(timeRemaining)}</span>
                            <button className="timer-cancel" onClick={() => handleSetTimer(null)}>✖️</button>
                        </div>    
                    ) : (
                <div className="timer-presets">
                      <span>⏱️</span>
                      <button onClick={() => handleSetTimer(10)}>10m</button>
                      <button onClick={() => handleSetTimer(20)}>20m</button>
                      <button onClick={() => handleSetTimer(30)}>30m</button>
                      <button onClick={() => handleSetTimer(60)}>60m</button>
                      </div>
                    )}   
                </div> 
            </>
        ) : (
                <div className="track-info">
                    <h4>🎵 Select a soundscape to begin</h4>
                    <span>Your healing journey awaits</span>
                </div>
        )}
        </div>
      </section>

         {/* Frequency Modal */}
         { showModal && selectedFrequency && (
            <div className='modal-overlay' onClick={closeModal}>
                <div className='modal' onClick={(e) => e.stopPropagation()}>
                    <button className='modal-close' onClick={closeModal}>✖️</button>

                    <h2 style={{ color: selectedFrequency.color }}>
                        {selectedFrequency.hz}Hz
                    </h2>
                    <h3>{selectedFrequency.name}</h3>

                    <p>{selectedFrequency.description}</p>

                    <div className='frequency-details'>
                        <div className="detail">
                            <span className="detail-label">Benefits</span>
                            <span>{selectedFrequency.benefits}</span>
                        </div>
                        <div className="detail">
                            <span className="detail-label">Chakra</span>
                            <span style={{ color: selectedFrequency.color}}>
                              {selectedFrequency.chakra}  
                            </span>
                        </div>
                    </div>
                </div>
            </div>
         )}
    </main>
  );
};
export default BrowsePage;