// Sound effects system

let soundsEnabled = localStorage.getItem('taskflow-sounds') !== 'false';
let soundVolume = parseFloat(localStorage.getItem('taskflow-sound-volume') || '0.5');

/**
 * Play sound effect
 */
function playSound(type) {
    if (!soundsEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = soundVolume;
    
    const frequencies = {
        success: 523.25, // C5
        error: 220,      // A3
        complete: 659.25, // E5
        delete: 196,     // G3
        add: 440         // A4
    };
    
    const frequency = frequencies[type] || 440;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(soundVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

/**
 * Toggle sounds
 */
function toggleSounds() {
    soundsEnabled = !soundsEnabled;
    localStorage.setItem('taskflow-sounds', soundsEnabled.toString());
    showToast(`Sounds ${soundsEnabled ? 'enabled' : 'disabled'}`, 'info');
    return soundsEnabled;
}

/**
 * Set sound volume
 */
function setSoundVolume(volume) {
    soundVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('taskflow-sound-volume', soundVolume.toString());
}

/**
 * Show sound settings
 */
function showSoundSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2>🔊 Sound Settings</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div style="padding: 20px;">
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="soundsEnabled" ${soundsEnabled ? 'checked' : ''}>
                        Enable sound effects
                    </label>
                </div>
                <div class="form-group">
                    <label>Volume</label>
                    <input type="range" id="soundVolume" min="0" max="1" step="0.1" value="${soundVolume}">
                    <span id="volumeDisplay">${Math.round(soundVolume * 100)}%</span>
                </div>
                <div class="form-group">
                    <button class="btn btn-primary" id="testSound">Test Sound</button>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('soundsEnabled').addEventListener('change', (e) => {
        soundsEnabled = e.target.checked;
        localStorage.setItem('taskflow-sounds', soundsEnabled.toString());
    });
    
    document.getElementById('soundVolume').addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        setSoundVolume(volume);
        document.getElementById('volumeDisplay').textContent = Math.round(volume * 100) + '%';
    });
    
    document.getElementById('testSound').addEventListener('click', () => {
        playSound('success');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}
