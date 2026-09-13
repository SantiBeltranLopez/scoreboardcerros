/**
 * ==========================================================================
 * ARCADE CLASSROOM SCOREBOARD
 * Game-themed score tracking web app for 1st, 2nd, and 3rd grade.
 * Features 100% localStorage persistence, native 8-bit Web Audio,
 * real-time HP/XP progress bars, and JSON backup export/import.
 * ==========================================================================
 */

// Storage keys
const STORAGE_KEY = 'marcador_gamer_data_en_v1';
const LEGACY_STORAGE_KEY = 'marcador_gamer_data_v1';

// Standard weekly score target for the HP/XP meter
const WEEKLY_GOAL = 150;

// Grade Configurations
const GRADE_CONFIG = {
  '1': { label: '1ST GRADE', world: 'WORLD 1-1' },
  '2': { label: '2ND GRADE', world: 'WORLD 2-1' },
  '3': { label: '3RD GRADE', world: 'WORLD 3-1' }
};

// Default Team Models (Retro Gamer / Mario / Minecraft Theme)
const DEFAULT_TEAMS_DATA = {
  '1': [
    { id: '1-1', name: 'GREEN MUSHROOM', avatar: '🍄', color: 'green', score: 0 },
    { id: '1-2', name: 'RED STAR', avatar: '🔥', color: 'red', score: 0 },
    { id: '1-3', name: 'GOLD COIN', avatar: '🪙', color: 'yellow', score: 0 },
    { id: '1-4', name: 'BLUE GEM', avatar: '💎', color: 'blue', score: 0 }
  ],
  '2': [
    { id: '2-1', name: 'GREEN CREEPER', avatar: '🟩', color: 'green', score: 0 },
    { id: '2-2', name: 'TNT BLAST', avatar: '🧨', color: 'red', score: 0 },
    { id: '2-3', name: 'SUPER STAR', avatar: '⭐', color: 'yellow', score: 0 },
    { id: '2-4', name: 'ICE GOLEM', avatar: '❄️', color: 'blue', score: 0 }
  ],
  '3': [
    { id: '3-1', name: 'YOSHI DRAGONS', avatar: '🦖', color: 'green', score: 0 },
    { id: '3-2', name: 'SPEED FALCON', avatar: '⚡', color: 'red', score: 0 },
    { id: '3-3', name: 'ROYAL TRIFORCE', avatar: '👑', color: 'yellow', score: 0 },
    { id: '3-4', name: 'CYAN PORTAL', avatar: '🌀', color: 'blue', score: 0 }
  ]
};

/**
 * Native 8-Bit Retro Sound Synthesizer (Web Audio API)
 * Zero external audio files required, 100% offline.
 */
class RetroSoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Retro Coin Sound (+1)
  playCoin() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Power-Up Arpeggio (+5)
  playPowerUp() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [330, 392, 659, 523, 587, 784];

    notes.forEach((freq, i) => {
      const startTime = now + (i * 0.05);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.07);
    });
  }

  // Damage / Bump Sound (-1)
  playDamage() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Victory / Stage Clear Fanfare
  playVictory() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = [
      { freq: 523.25, dur: 0.12 }, // C5
      { freq: 659.25, dur: 0.12 }, // E5
      { freq: 783.99, dur: 0.12 }, // G5
      { freq: 1046.50, dur: 0.22 }, // C6
      { freq: 783.99, dur: 0.10 }, // G5
      { freq: 1046.50, dur: 0.45 }  // C6
    ];

    let t = now;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + note.dur);
      t += note.dur + 0.03;
    });
  }

  // Warp / Pipe Sound (for resets)
  playWarp() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

const sfx = new RetroSoundFX();

/**
 * Main Scoreboard Application Class
 */
class ArcadeScoreboardApp {
  constructor() {
    this.currentGrade = '1';
    this.teamsData = this.loadFromStorage();

    // DOM Element References
    this.teamsContainer = document.getElementById('teams-container');
    this.gradeTabs = document.querySelectorAll('.grade-tab-btn');
    this.hudWorld = document.querySelector('.hud-world');

    // Toolbar Buttons
    this.btnWinner = document.getElementById('btn-winner');
    this.btnReset = document.getElementById('btn-reset');
    this.btnExport = document.getElementById('btn-export');
    this.btnImportTrigger = document.getElementById('btn-import-trigger');
    this.fileImportInput = document.getElementById('file-import');

    // Victory Modal Elements
    this.winnerModal = document.getElementById('winner-modal');
    this.winnerGradeText = document.getElementById('winner-grade-text');
    this.winnerTeamName = document.getElementById('winner-team-name');
    this.winnerScoreVal = document.getElementById('winner-score-val');
    this.btnCloseWinner = document.getElementById('btn-close-winner');

    this.init();
  }

  /**
   * Load data from localStorage or initialize with English defaults
   */
  loadFromStorage() {
    try {
      // Check for current English storage key
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed['1'] && parsed['2'] && parsed['3']) {
          return parsed;
        }
      }

      // Check for legacy storage key and check if user has custom scores
      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        const hasScores = Object.values(parsedLegacy).some(gradeTeams =>
          Array.isArray(gradeTeams) && gradeTeams.some(t => t.score > 0)
        );

        if (hasScores) {
          // Preserve previous state and save to current key
          this.saveToStorage(parsedLegacy);
          return parsedLegacy;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage. Using default data.', e);
    }

    // Default template in English
    const initialData = JSON.parse(JSON.stringify(DEFAULT_TEAMS_DATA));
    this.saveToStorage(initialData);
    return initialData;
  }

  /**
   * Save current state to localStorage
   */
  saveToStorage(data = this.teamsData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  /**
   * Initialize events and initial view
   */
  init() {
    this.bindEvents();
    this.renderActiveGrade();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // 1. Grade Selector Tabs
    this.gradeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const selectedGrade = tab.getAttribute('data-grade');
        if (selectedGrade && selectedGrade !== this.currentGrade) {
          this.switchGrade(selectedGrade);
        }
      });
    });

    // 2. Event Delegation for Teams Container (Score adjustments & Name editing)
    this.teamsContainer.addEventListener('click', (e) => {
      const scoreBtn = e.target.closest('.btn-score');
      if (scoreBtn) {
        const card = scoreBtn.closest('.team-card');
        const teamId = card.getAttribute('data-team-id');
        const action = scoreBtn.getAttribute('data-action');
        this.updateScore(teamId, action);
      }
    });

    // Save team name edit on blur
    this.teamsContainer.addEventListener('blur', (e) => {
      if (e.target.classList.contains('team-name')) {
        const card = e.target.closest('.team-card');
        const teamId = card.getAttribute('data-team-id');
        const newName = e.target.innerText.trim().toUpperCase() || 'TEAM';
        this.updateTeamName(teamId, newName);
      }
    }, true);

    // Prevent enter key from creating newline
    this.teamsContainer.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('team-name') && e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
      }
    });

    // 3. Declare Winner Button
    this.btnWinner.addEventListener('click', () => {
      this.declareWinner();
    });

    // 4. Reset Week Button
    this.btnReset.addEventListener('click', () => {
      this.resetWeek();
    });

    // 5. Save Backup (.json) Button
    this.btnExport.addEventListener('click', () => {
      this.exportJSON();
    });

    // 6. Load Backup Button
    this.btnImportTrigger.addEventListener('click', () => {
      this.fileImportInput.click();
    });

    this.fileImportInput.addEventListener('change', (e) => {
      this.importJSON(e);
    });

    // 7. Victory Modal Controls
    this.btnCloseWinner.addEventListener('click', () => {
      this.closeWinnerModal();
    });

    this.winnerModal.addEventListener('click', (e) => {
      if (e.target === this.winnerModal) {
        this.closeWinnerModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.winnerModal.classList.contains('hidden')) {
        this.closeWinnerModal();
      }
    });
  }

  /**
   * Switch active grade view
   */
  switchGrade(gradeNumber) {
    this.currentGrade = gradeNumber;

    this.gradeTabs.forEach(tab => {
      if (tab.getAttribute('data-grade') === gradeNumber) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    if (this.hudWorld && GRADE_CONFIG[gradeNumber]) {
      this.hudWorld.textContent = GRADE_CONFIG[gradeNumber].world;
    }

    sfx.playCoin();
    this.renderActiveGrade();
  }

  /**
   * Render the 4 teams of the active grade
   */
  renderActiveGrade() {
    const teams = this.teamsData[this.currentGrade] || [];
    this.teamsContainer.innerHTML = '';

    teams.forEach((team, idx) => {
      const hpPercent = Math.min(100, Math.max(0, Math.round((team.score / WEEKLY_GOAL) * 100)));

      const card = document.createElement('article');
      card.className = `team-card team-${team.color}`;
      card.setAttribute('data-team-id', team.id);

      card.innerHTML = `
        <div class="card-header">
          <span class="team-badge">TEAM ${idx + 1}</span>
          <span class="team-avatar">${team.avatar}</span>
        </div>
        <h2 class="team-name" contenteditable="true" spellcheck="false" title="Click to edit name">${team.name}</h2>
        <div class="score-box">
          <span class="score-number">${team.score}</span>
          <span class="score-label">PTS</span>
        </div>
        <div class="hp-section">
          <div class="hp-label-row">
            <span class="hp-text">HP / XP</span>
            <span class="hp-val">${team.score} / ${WEEKLY_GOAL}</span>
          </div>
          <div class="hp-bar-frame">
            <div class="hp-bar-fill" style="width: ${hpPercent}%;"></div>
          </div>
        </div>
        <div class="score-controls">
          <button class="btn-score btn-sub-1" data-action="-1" title="Subtract 1 point">-1</button>
          <button class="btn-score btn-add-1" data-action="+1" title="Add 1 point">+1</button>
          <button class="btn-score btn-add-5" data-action="+5" title="Add 5 points">+5</button>
        </div>
      `;

      this.teamsContainer.appendChild(card);
    });
  }

  /**
   * Adjust score (+1, +5, -1) with real-time update and persistence
   */
  updateScore(teamId, action) {
    const teams = this.teamsData[this.currentGrade];
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    let delta = 0;
    if (action === '+1') {
      delta = 1;
      sfx.playCoin();
    } else if (action === '+5') {
      delta = 5;
      sfx.playPowerUp();
    } else if (action === '-1') {
      delta = -1;
      sfx.playDamage();
    }

    // Score cannot be negative
    team.score = Math.max(0, team.score + delta);

    // Save to localStorage
    this.saveToStorage();

    // Responsive DOM update for fast rendering
    const card = this.teamsContainer.querySelector(`[data-team-id="${teamId}"]`);
    if (card) {
      const scoreNumEl = card.querySelector('.score-number');
      const hpValEl = card.querySelector('.hp-val');
      const hpFillEl = card.querySelector('.hp-bar-fill');

      if (scoreNumEl) scoreNumEl.textContent = team.score;
      if (hpValEl) hpValEl.textContent = `${team.score} / ${WEEKLY_GOAL}`;

      const hpPercent = Math.min(100, Math.max(0, Math.round((team.score / WEEKLY_GOAL) * 100)));
      if (hpFillEl) hpFillEl.style.width = `${hpPercent}%`;

      // Visual pop animation on counter
      scoreNumEl.style.transform = 'scale(1.25)';
      setTimeout(() => {
        scoreNumEl.style.transform = 'scale(1)';
      }, 120);
    }
  }

  /**
   * Update custom team name
   */
  updateTeamName(teamId, newName) {
    const teams = this.teamsData[this.currentGrade];
    const team = teams.find(t => t.id === teamId);
    if (team && team.name !== newName) {
      team.name = newName;
      this.saveToStorage();
    }
  }

  /**
   * Declare winning team(s) for the active grade
   */
  declareWinner() {
    const teams = this.teamsData[this.currentGrade] || [];
    if (teams.length === 0) return;

    const maxScore = Math.max(...teams.map(t => t.score));
    const gradeTitle = GRADE_CONFIG[this.currentGrade]?.label || `${this.currentGrade} GRADE`;

    this.winnerGradeText.textContent = `${gradeTitle} - ELEMENTARY`;

    if (maxScore === 0) {
      this.winnerTeamName.textContent = 'ALL AT THE STARTING LINE!';
      this.winnerScoreVal.textContent = '0 PTS';
    } else {
      const winners = teams.filter(t => t.score === maxScore);

      if (winners.length > 1) {
        const names = winners.map(w => `${w.avatar} ${w.name}`).join(' & ');
        this.winnerTeamName.textContent = `TIE! ${names}`;
      } else {
        this.winnerTeamName.textContent = `${winners[0].avatar} ${winners[0].name}`;
      }

      this.winnerScoreVal.textContent = `${maxScore} PTS`;
    }

    sfx.playVictory();
    this.winnerModal.classList.remove('hidden');
  }

  /**
   * Close victory modal
   */
  closeWinnerModal() {
    this.winnerModal.classList.add('hidden');
  }

  /**
   * Reset weekly scores to 0
   */
  resetWeek() {
    const confirmed = confirm('Are you sure you want to reset the scores for this week?');

    if (confirmed) {
      const teams = this.teamsData[this.currentGrade];
      teams.forEach(t => {
        t.score = 0;
      });

      this.saveToStorage();
      this.renderActiveGrade();
      sfx.playWarp();
    }
  }

  /**
   * Export all grades and teams data to downloadable JSON backup
   */
  exportJSON() {
    try {
      const dataString = JSON.stringify(this.teamsData, null, 2);
      const blob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const dateSuffix = now.toISOString().slice(0, 10);
      const fileName = `scoreboard_backup_${dateSuffix}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      sfx.playCoin();
    } catch (e) {
      console.error('Error exporting JSON backup:', e);
      alert('An error occurred while exporting the backup file.');
    }
  }

  /**
   * Import JSON backup and restore scores
   */
  importJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate schema: must contain grades '1', '2', '3' with 4 teams each
        const isValid = ['1', '2', '3'].every(gradeKey => {
          return Array.isArray(importedData[gradeKey]) && importedData[gradeKey].length === 4;
        });

        if (!isValid) {
          throw new Error('Invalid schema format.');
        }

        this.teamsData = importedData;
        this.saveToStorage();
        this.renderActiveGrade();
        sfx.playPowerUp();
        alert('Scores successfully loaded!');
      } catch (err) {
        console.error('Error importing backup:', err);
        alert('Invalid file format. Please upload a valid JSON backup.');
      } finally {
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ArcadeScoreboardApp();
});
