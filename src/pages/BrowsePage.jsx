import { useEffect, useState } from "react";

import { getSoundscapes, getAudioUrl, getSoundscape } from '../services/soundscapeService';
import { createSession, updateSession } from '../services/sessionService';

const BrowsePage = () => {
    const [soundscapes, setSoundscapes] = useState([]);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

// Audio Player State
const [currentTrack, setCurrentTrack] = useState(null); 
const [isPlaying, setIsPlaying] = useState(false); 
const [audio] = useState(new Audio()); 
const [currentTime, setCurrentTime] = useState(0); 
const [volume, setVolume] = useState(0.75); 
const [duration, setDuration] = useState(0); 
const [sessionId, setSessionId] = useState(null); 

// Fetch Soundscapes
useEffect(() => {
    const fetchedSoundscapes = async () => {
        try {
            setLoading(true);
            const data = await getSoundscapes(category || null);
            setSoundscapes(data);
        } catch (err) {
            setError('Failed to load soundscapes');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    fetchedSoundscapes();
}, [category]);

// Audio event listners
useEffect(() => {
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended = () => handleStop();

    return () => {
        audio.pause();
        audio.src = '';
    };
}, [audio]);

// Play soundscape
const handlePlay = async (soundscape) => {
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
};

// stop playback
const handleStop = async () => {
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);

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
    audio.volume = newVolume;
};
//  Seek
const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
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
                    <p>{soundscape.description}</p>
                    <div className='card-meta'>
                        <span>{soundscape.category}</span>
                        <span>{soundscape.genre}</span>
                        <span className="frequency-badge">{soundscape.frequency_hz}Hz</span>
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
               <div className="audio-player-content">
                {currentTrack ? (
                  <>
                    <div className="track-info">
                        <h4>🎵 {currentTrack.name}</h4>
                        <span>{currentTime.name} • {currentTrack.frequency_hz}Hz</span>
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
                </>
            ) : (
                <div className="track-info">
                    <h4>🎵 Select a soundscape to begin</h4>
                    <span>Your healing journey awaits</span>
                </div>
        )}
        </div>
      </section>   
    </main>
  );
};
export default BrowsePage;