import { useEffect, useState } from "react";

import { setSoundscapes, getAudioUrl, getSoundscapes } from '../services/soundscapeService';
import { createStation, updateSession } from '../services/sessionService';

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
    fetchSoundscapes();
}, [category]);

// Audio event listners
useEffect(() => {
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(setDuration.duration);
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
        setSessionId(sessionId.id);
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
                completed: currentTime >= duration *0.9
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
    const newVolume = math.min(parseFloat(e.target.value), 0.9);
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
    return `${mins}:${secs.toString().padStart(2, 0)}`;
};

if (loading) return <main><p>Loadingd soundscapes...</p></main>;
if (error) return <main><p>{error}</p></main>;

return (
    <main>
        <h1>Browse Soundscapes</h1>

        {/* Category Filter */}
        <section>
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
                All
            </button>
        </section>

        {/* Soundscape List */}
        <section>
            {soundscapes.length > 0 ? (
              soundscapes.map((soundscape) => (
                <div key={soundscape.id} className='soundscape-card'>
                    <h3>{soundscape.name}</h3>
                    <p>{soundscape.description}</p>
                    <p>
                        {soundscape.category} • {soundscape.genre} • {soundscape.frequency_hz}Hz
                    </p>
                    <p>{Math.floor(soundscape.duration_seconds / 60)} min</p>
                    <button onClick={() => handlePlay(soundscape)}>
                        {currentTrack?.id === soundscape.id && isPlaying ? 'Pause' : 'Play'}
                    </button>
                </div>
              ))
            ) : (
                <p>No soundscapes found.</p>  
            )}
        </section>

        {/* Audio Player */}
        {currentTrack && (
            <section className='audio=player'>
                <h4>{currentTime.name}</h4>

                {/* Progress */}
                <div>
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

                {/* Controls */}
                <div>
                    <button onClick={() => handlePlay(currentTrack)}>
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={handleStop}>Stop</button>
                </div>

                {/* Volume */}
                <div>
                    <span>🔈</span>
                    <input
                    type='range'
                    min='0'
                    max='0.9'
                    step='0.01'
                    value={volume}
                    onChange={hanldVolumeChange}
                    />
                    <span>🔈</span>
                </div>
            </section>
        )}
    </main>
  );
};
export default BrowsePage;