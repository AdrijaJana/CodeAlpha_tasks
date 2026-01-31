// Track data with sample audio URLs
const tracks = [
    { 
        title: 'Summer Vibes',
        artist: 'The Sunny Band', 
        duration: 225,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    { 
        title: 'Night Drive', 
        artist: 'Electric Dreams', 
        duration: 252,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    { 
        title: 'Ocean Waves', 
        artist: 'Coastal Vibes', 
        duration: 208,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    { 
        title: 'Electric Pulse', 
        artist: 'Synth Masters', 
        duration: 240,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    { 
        title: 'Midnight Echo', 
        artist: 'Dark Moon', 
        duration: 236,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    }
];

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressRange = document.getElementById('progressRange');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const trackNameEl = document.getElementById('trackName');
const artistNameEl = document.getElementById('artistName');
const volumeRange = document.getElementById('volumeRange');
const volumeValue = document.getElementById('volumeValue');
const playlistItems = document.querySelectorAll('.playlist-item');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const musicPlayer = document.querySelector('.music-player');

// Player State Management
const playerState = {
    currentTrackIndex: 0,
    isPlaying: false,
    shuffle: false,
    repeatMode: 0, // 0: no repeat, 1: repeat all, 2: repeat one
    autoplay: true, // Enable autoplay by default
    playedTracks: [] // Track played songs for shuffle
};

// Initialize
init();

function init() {
    updateTrackInfo();
    loadTrack();
    updatePlaylistUI();
    audioPlayer.volume = 0.7;
    volumeValue.textContent = volumeRange.value + '%';
    
    // Event Listeners - Audio Player Events
    audioPlayer.addEventListener('play', onAudioPlay);
    audioPlayer.addEventListener('pause', onAudioPause);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleTrackEnd);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('error', handleAudioError);
    
    // Event Listeners - Control Buttons
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    progressRange.addEventListener('change', setProgress);
    progressRange.addEventListener('input', previewProgress);
    
    // Event Listeners - Volume Control
    volumeRange.addEventListener('input', setVolume);
    
    // Event Listeners - Special Controls
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // Event Listeners - Playlist
    playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => selectTrack(index));
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyPress);
    
    console.log('Music Player initialized');
}

// AUDIO CONTROL METHODS


// Play or Pause current track
function togglePlay() {
    if (playerState.isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// Play audio with error handling
function playAudio() {
    try {
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    playerState.isPlaying = true;
                    updatePlayUI();
                })
                .catch((error) => {
                    console.error('Play failed:', error);
                    handleAudioError(error);
                });
        }
    } catch (error) {
        console.error('Error playing audio:', error);
    }
}

// Pause audio
function pauseAudio() {
    audioPlayer.pause();
    playerState.isPlaying = false;
    updatePlayUI();
}

// Update play button UI
function updatePlayUI() {
    if (playerState.isPlaying) {
        playBtn.innerHTML = '<span class="icon">⏸</span>';
        musicPlayer.classList.add('playing');
    } else {
        playBtn.innerHTML = '<span class="icon">▶</span>';
        musicPlayer.classList.remove('playing');
    }
}

// Audio Play Event Handler
function onAudioPlay() {
    playerState.isPlaying = true;
    updatePlayUI();
}

// Audio Pause Event Handler
function onAudioPause() {
    playerState.isPlaying = false;
    updatePlayUI();
}

// Handle audio errors
function handleAudioError(error) {
    console.error('Audio error:', error);
    pauseAudio();
}

// TRACK NAVIGATION METHODS
 

// Next Track
function nextTrack() {
    if (playerState.shuffle) {
        playRandomTrack();
    } else {
        playerState.currentTrackIndex = (playerState.currentTrackIndex + 1) % tracks.length;
        selectTrack(playerState.currentTrackIndex);
    }
}

// Previous Track
function prevTrack() {
    // If more than 3 seconds played, restart current track
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
    } else {
        playerState.currentTrackIndex = (playerState.currentTrackIndex - 1 + tracks.length) % tracks.length;
        selectTrack(playerState.currentTrackIndex);
    }
}

// Play random track for shuffle mode
function playRandomTrack() {
    const randomIndex = Math.floor(Math.random() * tracks.length);
    selectTrack(randomIndex);
}

// Select specific track
function selectTrack(index) {
    playerState.currentTrackIndex = index;
    updateTrackInfo();
    updatePlaylistUI();
    loadTrack();
    
    if (playerState.autoplay) {
        playAudio();
    }
}

// Load track into audio player
function loadTrack() {
    const track = tracks[playerState.currentTrackIndex];
    audioPlayer.src = track.url;
    audioPlayer.load();
}

// TRACK INFORMATION METHODS
 

// Update track info display
function updateTrackInfo() {
    const track = tracks[playerState.currentTrackIndex];
    trackNameEl.textContent = track.title;
    artistNameEl.textContent = track.artist;
    durationEl.textContent = formatTime(track.duration);
    progressRange.max = track.duration;
}

// Update progress bar and time display
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    
    if (!isNaN(duration)) {
        // Update progress bar
        progressRange.value = currentTime;
        progress.style.width = (currentTime / duration) * 100 + '%';
        
        // Update time displays
        currentTimeEl.textContent = formatTime(currentTime);
    }
}

// Preview progress while dragging
function previewProgress() {
    const previewTime = formatTime(progressRange.value);
    currentTimeEl.textContent = previewTime;
}

// Set progress when user seeks
function setProgress() {
    audioPlayer.currentTime = progressRange.value;
}

// Update duration when metadata loads
function updateDuration() {
    const duration = audioPlayer.duration;
    if (!isNaN(duration)) {
        durationEl.textContent = formatTime(duration);
        progressRange.max = duration;
    }
}

// Format seconds to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// VOLUME CONTROL
 

function setVolume() {
    const volume = volumeRange.value / 100;
    audioPlayer.volume = volume;
    volumeValue.textContent = volumeRange.value + '%';
}

// PLAYLIST & AUTOPLAY


// Update playlist UI
function updatePlaylistUI() {
    playlistItems.forEach((item, index) => {
        if (index === playerState.currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Handle track end - Autoplay next track
function handleTrackEnd() {
    if (!playerState.autoplay) {
        pauseAudio();
        return;
    }
    
    if (playerState.repeatMode === 2) {
        // Repeat one track
        audioPlayer.currentTime = 0;
        playAudio();
    } else if (playerState.shuffle) {
        // Play random track
        playRandomTrack();
    } else {
        // Play next track
        nextTrack();
    }
}

// SPECIAL CONTROLS


// Toggle Shuffle
function toggleShuffle() {
    playerState.shuffle = !playerState.shuffle;
    shuffleBtn.classList.toggle('active');
    console.log('Shuffle:', playerState.shuffle ? 'ON' : 'OFF');
}

// Toggle Repeat Mode
function toggleRepeat() {
    playerState.repeatMode = (playerState.repeatMode + 1) % 3;
    
    if (playerState.repeatMode === 0) {
        repeatBtn.classList.remove('active');
        repeatBtn.innerHTML = '<span class="icon">🔁</span>';
    } else if (playerState.repeatMode === 1) {
        repeatBtn.classList.add('active');
        repeatBtn.innerHTML = '<span class="icon">🔁</span>';
    } else if (playerState.repeatMode === 2) {
        repeatBtn.classList.add('active');
        repeatBtn.innerHTML = '<span class="icon">🔂</span>';
    }
    console.log('Repeat mode:', playerState.repeatMode);
}

// KEYBOARD SHORTCUTS
 

function handleKeyPress(e) {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowRight':
            nextTrack();
            break;
        case 'ArrowLeft':
            prevTrack();
            break;
        case 'ArrowUp':
            volumeRange.value = Math.min(100, parseInt(volumeRange.value) + 10);
            setVolume();
            break;
        case 'ArrowDown':
            volumeRange.value = Math.max(0, parseInt(volumeRange.value) - 10);
            setVolume();
            break;
    }
}
