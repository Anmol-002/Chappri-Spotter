// Dynamic combat engine: Procedural Web Audio FX + multi-stage punch & hair-pulling battle choreography
import { CHARACTERS } from './data.js';
import { state } from './state.js';

/* ---------- Procedural Web Audio Synthesizer ---------- */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type) {
  if (state.ui.soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'punch') {
      const noiseLen = Math.floor(ctx.sampleRate * 0.06);
      const buffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const nFilter = ctx.createBiquadFilter();
      nFilter.type = 'highpass';
      nFilter.frequency.value = 800;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.55, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.07);

      const thump = ctx.createOscillator();
      const tGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(90, now);
      thump.frequency.exponentialRampToValueAtTime(38, now + 0.16);
      tGain.gain.setValueAtTime(0.85, now);
      tGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      thump.connect(tGain);
      tGain.connect(ctx.destination);
      thump.start(now);
      thump.stop(now + 0.2);
    } else if (type === 'slap') {
      // Sharp slap snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === 'kiss_smooch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);

      const wetLen = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, wetLen, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < wetLen; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / wetLen) * 0.5;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1400;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.28, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.13);
    } else if (type === 'heartbeat') {
      [0, 0.18].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(i === 0 ? 70 : 58, now + offset);
        osc.frequency.exponentialRampToValueAtTime(32, now + offset + 0.12);
        gain.gain.setValueAtTime(0.55, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } else if (type === 'breath') {
      const len = Math.floor(ctx.sampleRate * 0.45);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * 0.35;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, now);
      filter.frequency.linearRampToValueAtTime(220, now + 0.4);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.46);
    } else if (type === 'sultry_whisper') {
      // Naughty whisper / sweep synth
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.25);
      osc.frequency.linearRampToValueAtTime(240, now + 0.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'aunty_alarm') {
      // High-pitched aunty sanskaar emergency siren
      [0, 0.15, 0.3, 0.45].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(idx % 2 === 0 ? 880 : 660, now + offset);
        osc.frequency.linearRampToValueAtTime(idx % 2 === 0 ? 980 : 580, now + offset + 0.14);
        gain.gain.setValueAtTime(0.35, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } else if (type === 'red_flag') {
      // Buzzer sound for toxic / red flag detection
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(130, now + 0.15);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'roulette_spin') {
      // Slot machine tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'jackpot') {
      // Jackpot / match found jingle
      [0, 0.08, 0.16, 0.24, 0.32].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        osc.frequency.setValueAtTime(freqs[idx], now + offset);
        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.22);
      });
    } else if (type === 'hair_pull') {
      // High-pitched screech/whoosh for hair pull drama
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.12);
      osc.frequency.linearRampToValueAtTime(400, now + 0.28);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'ko') {
      // Dramatic KO gong / bell
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(110, now + 1.2);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.8);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } else if (type === 'honk') {
      // Delhi traffic double-honk
      [0, 0.12].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, now + offset);
        gain.gain.setValueAtTime(0.4, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
    } else if (type === 'cheer') {
      // Crowd cheer synth noise
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.8);
    } else if (type === 'whoosh') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // Audio context initialization blocked or unsupported; silent fallback
  }
}

let ambienceNodes = null;

export function setAfterDarkAmbience(on) {
  if (!on || state.ui.soundMuted) {
    if (ambienceNodes) {
      try {
        ambienceNodes.osc.stop();
        ambienceNodes.lfo?.stop();
        ambienceNodes.osc.disconnect();
        ambienceNodes.gain.disconnect();
      } catch {
        /* already stopped */
      }
      ambienceNodes = null;
    }
    return;
  }
  if (ambienceNodes) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 92;
    lfo.type = 'sine';
    lfo.frequency.value = 0.35;
    lfoGain.gain.value = 18;
    gain.gain.value = 0.045;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    lfo.start();
    ambienceNodes = { osc, lfo, gain };
  } catch {
    ambienceNodes = null;
  }
}

/* ---------- Comic Taunts & Battle Shouts ---------- */
const BADDIE_SHOUTS = [
  'AAAH MERI 5K KI EXTENSIONS NAHI!',
  'DON’T TOUCH MY HAIR, SWEETIE!',
  'TERA FOUNDATION SAROJINI SE HAI!',
  'MY NAILS COST MORE THAN YOUR RENT!',
  'CHATAAK! SLAP FROM SOUTH DELHI!',
  'I AM CALLING MY LAWYER & MY DERMATOLOGIST!',
];

const CHAPRI_SHOUTS = [
  'OYE! EK KICK MEIN REEL BANA DOONGA!',
  'TERE KO PATA HAI MERA BAAP KAUN HAI?!',
  'KTM WHEELIE ON YOUR HEAD!',
  'TRIPOD KI KASAM, NAHI CHODUNGA!',
  'BHAI EK BAAR AUR!',
];

const GYM_SHOUTS = [
  'AAJ CHEST DAY HAI, TU BICH MEIN MAT AA!',
  'DUMBBELL SMASH DEPLOYED!',
  'PROTEIN SHAKE KI TAAQAT!',
  'LAT SPREAD SE CRUSH HO JAYEGA!',
];

const TRAFFIC_SHOUTS = [
  'HORN INTENSIFIES! HAT SAAMNE SE!',
  'WRONG SIDE IS THE RIGHT SIDE!',
  'HIGH BEAM ON YOUR EYES!',
];

const UNCLE_SHOUTS = [
  'SHARMA JI KA BETA IS BETTER THAN YOU!',
  'SANSKAAR LEVEL: CRITICAL!',
  'MUMMY PAPA KO CALL KAR RAHA HOON!',
  'BALCONY SURVEILLANCE ACTIVATED!',
];

const MAKEOUT_SHOUTS = [
  'group chat can wait.',
  'come here. no cameras.',
  'oyo is 400 metres. just saying.',
  'we are NOT catching feelings.',
  'hazard lights already on.',
  'shh. uncle is on the balcony.',
  'one more and we leave the party.',
];

function getShout(charKey, isNsfw = false) {
  if (isNsfw) return MAKEOUT_SHOUTS[Math.floor(Math.random() * MAKEOUT_SHOUTS.length)];
  if (charKey === 'baddie') {
    return BADDIE_SHOUTS[Math.floor(Math.random() * BADDIE_SHOUTS.length)];
  }
  if (charKey === 'chapri') return CHAPRI_SHOUTS[Math.floor(Math.random() * CHAPRI_SHOUTS.length)];
  if (charKey === 'gym') return GYM_SHOUTS[Math.floor(Math.random() * GYM_SHOUTS.length)];
  if (charKey === 'traffic') return TRAFFIC_SHOUTS[Math.floor(Math.random() * TRAFFIC_SHOUTS.length)];
  if (charKey === 'uncle') return UNCLE_SHOUTS[Math.floor(Math.random() * UNCLE_SHOUTS.length)];
  return 'FATAAAK! DHISHUM!';
}

/* ---------- Combat Engine Choreography ---------- */
export function buildFightHtml(fight, a, b, aChar, bChar, winner, loser) {
  const isBaddieFight = aChar === 'baddie' || bChar === 'baddie';
  const bothBaddies = aChar === 'baddie' && bChar === 'baddie';
  const aCharObj = CHARACTERS[aChar] || CHARACTERS.chapri;
  const bCharObj = CHARACTERS[bChar] || CHARACTERS.chapri;
  const isNsfw = Boolean(state.ui.nsfw);

  if (isNsfw) {
    return `
    <div class="combat-arena nsfw-combat makeout-arena">
      <div class="fog-vignette"></div>
      <div class="combat-header">
        <div class="combat-tag"><i></i> 💋 AFTER DARK · LIVE MAKEOUT</div>
        <div class="combat-matchup">${a.name.toUpperCase()} <span class="vs">×</span> ${b.name.toUpperCase()}</div>
        <button class="skip-fight" type="button" data-skip>SKIP</button>
      </div>
      <div class="combat-health-row">
        <div class="fighter-hp fighter-a-hp">
          <div class="hp-label"><b>${a.name.toUpperCase()}</b><span id="hpAVal">RIZZ 20%</span></div>
          <div class="hp-bar chemistry"><div class="hp-fill" id="hpAFill" style="width: 20%;"></div></div>
        </div>
        <div class="vs-badge">💋</div>
        <div class="fighter-hp fighter-b-hp">
          <div class="hp-label"><span id="hpBVal">RIZZ 20%</span><b>${b.name.toUpperCase()}</b></div>
          <div class="hp-bar chemistry"><div class="hp-fill" id="hpBFill" style="width: 20%;"></div></div>
        </div>
      </div>
      <div class="combo-meter" id="comboMeter">CHEMISTRY x0</div>
      <div class="combat-stage">
        <div class="fighter-wrapper fighter-a-box" id="fighterA">
          <div class="fighter-bubble" id="bubbleA">${getShout(aChar, true)}</div>
          <div class="fighter-sprite">
            <img src="${aCharObj.file}" alt="${a.name}" />
            <div class="glove glove-left kiss-prop">💋</div>
          </div>
          <div class="fighter-shadow"></div>
        </div>
        <div class="combat-fx" id="combatFx">
          <div class="fx-item fx-punch" id="fxPunch">💕</div>
          <div class="fx-item fx-text" id="fxText">MWAAH</div>
          <div class="hearts-rain" id="heartsRain">💗 💋 💓 💞 💘</div>
          <div class="lipstick-marks" id="lipstickMarks">💋 💋 💋</div>
        </div>
        <div class="fighter-wrapper fighter-b-box" id="fighterB">
          <div class="fighter-bubble" id="bubbleB">${getShout(bChar, true)}</div>
          <div class="fighter-sprite">
            <img src="${bCharObj.file}" alt="${b.name}" />
            <div class="glove glove-right kiss-prop">💋</div>
          </div>
          <div class="fighter-shadow"></div>
        </div>
      </div>
      <div class="combat-verdict" id="combatVerdict">
        <div class="verdict-banner">
          <span class="verdict-trophy">💋</span>
          <h3>THEY LEFT THE GROUP CHAT TOGETHER</h3>
          <p>${winner.name} had more rizz. ${loser.name} is “just friends” now.</p>
        </div>
      </div>
    </div>`;
  }

  const fightTypeTag = bothBaddies
    ? '💅 HIGH-VOLTAGE CATFIGHT & HAIR PULLING'
    : isBaddieFight
      ? '⚡ BADDIE SLAP & PUNCH SHOWDOWN'
      : '🥊 STREET BRAWL & PUNCH CLASH';

  return `
    <div class="combat-arena ${bothBaddies ? 'catfight-mode' : ''}">
      <div class="impact-flash" id="impactFlash"></div>
      <div class="combat-header">
        <div class="combat-tag"><i></i> ${fightTypeTag}</div>
        <div class="combat-matchup">${a.name.toUpperCase()} <span class="vs">VS</span> ${b.name.toUpperCase()}</div>
        <button class="skip-fight" type="button" data-skip>SKIP</button>
      </div>
      <div class="combat-health-row">
        <div class="fighter-hp fighter-a-hp">
          <div class="hp-label"><b>${a.name.toUpperCase()}</b><span id="hpAVal">100%</span></div>
          <div class="hp-bar"><div class="hp-fill" id="hpAFill" style="width: 100%;"></div></div>
        </div>
        <div class="vs-badge">⚡</div>
        <div class="fighter-hp fighter-b-hp">
          <div class="hp-label"><span id="hpBVal">100%</span><b>${b.name.toUpperCase()}</b></div>
          <div class="hp-bar"><div class="hp-fill" id="hpBFill" style="width: 100%;"></div></div>
        </div>
      </div>
      <div class="combo-meter" id="comboMeter">COMBO x0</div>
      <div class="combat-stage">
        <div class="fighter-wrapper fighter-a-box" id="fighterA">
          <div class="fighter-bubble" id="bubbleA">${getShout(aChar, false)}</div>
          <div class="fighter-sprite">
            <img src="${aCharObj.file}" alt="${a.name}" />
            ${aChar === 'baddie' ? '<div class="hair-extension hair-a">💇‍♀️</div>' : ''}
            <div class="glove glove-left">🥊</div>
          </div>
          <div class="fighter-shadow"></div>
        </div>
        <div class="combat-fx" id="combatFx">
          <div class="flying-fist fist-from-a" id="fistA">👊</div>
          <div class="flying-fist fist-from-b" id="fistB">👊</div>
          <div class="fx-item fx-punch" id="fxPunch">💥</div>
          <div class="fx-item fx-text" id="fxText">POW!</div>
          <div class="hair-pull-fx ${isBaddieFight ? 'active' : ''}" id="hairPullFx">
            <div class="hair-pull-hand">✊</div>
            <div class="hair-strands">✨💇‍♀️✨</div>
            <div class="hair-pull-text">CHOTI KHINCHAI!</div>
          </div>
        </div>
        <div class="fighter-wrapper fighter-b-box" id="fighterB">
          <div class="fighter-bubble" id="bubbleB">${getShout(bChar, false)}</div>
          <div class="fighter-sprite">
            <img src="${bCharObj.file}" alt="${b.name}" />
            ${bChar === 'baddie' ? '<div class="hair-extension hair-b">💇‍♀️</div>' : ''}
            <div class="glove glove-right">🥊</div>
          </div>
          <div class="fighter-shadow"></div>
        </div>
      </div>
      <div class="combat-verdict" id="combatVerdict">
        <div class="verdict-banner">
          <span class="verdict-trophy">🏆</span>
          <h3>${winner.name.toUpperCase()} WINS!</h3>
          <p>${bothBaddies ? 'Extensions intact. Drip undisputed.' : `${loser.name} has been knocked out!`}</p>
        </div>
      </div>
    </div>
  `;
}

function wireSkip(container, timers, finishEarly) {
  const btn = container.querySelector('[data-skip]');
  if (!btn) return;
  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    timers.forEach((id) => clearTimeout(id));
    finishEarly();
  };
}

function bumpCombo(container, n, label) {
  const meter = container.querySelector('#comboMeter');
  if (!meter) return;
  meter.textContent = `${label} x${n}`;
  meter.classList.add('hot');
  setTimeout(() => meter.classList.remove('hot'), 280);
}

function shakeArena(container) {
  const arena = container.querySelector('.combat-arena') || container.closest('.combat-arena') || container;
  arena.classList.add('arena-shake');
  setTimeout(() => arena.classList.remove('arena-shake'), 220);
}

function runMakeoutSequence(container, a, b, winner, loser, onDone) {
  const hpAFill = container.querySelector('#hpAFill');
  const hpBFill = container.querySelector('#hpBFill');
  const hpAVal = container.querySelector('#hpAVal');
  const hpBVal = container.querySelector('#hpBVal');
  const fighterA = container.querySelector('#fighterA');
  const fighterB = container.querySelector('#fighterB');
  const bubbleA = container.querySelector('#bubbleA');
  const bubbleB = container.querySelector('#bubbleB');
  const fxPunch = container.querySelector('#fxPunch');
  const fxText = container.querySelector('#fxText');
  const heartsRain = container.querySelector('#heartsRain');
  const lipstick = container.querySelector('#lipstickMarks');
  const combatVerdict = container.querySelector('#combatVerdict');
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let combo = 0;
  let done = false;

  let rizzA = 20;
  let rizzB = 20;

  function setRizz(who, amount) {
    if (who === 'A') {
      rizzA = Math.min(100, rizzA + amount);
      if (hpAFill) hpAFill.style.width = `${rizzA}%`;
      if (hpAVal) hpAVal.textContent = `RIZZ ${rizzA}%`;
    } else {
      rizzB = Math.min(100, rizzB + amount);
      if (hpBFill) hpBFill.style.width = `${rizzB}%`;
      if (hpBVal) hpBVal.textContent = `RIZZ ${rizzB}%`;
    }
  }

  function kiss(from) {
    const isA = from === 'A';
    combo += 1;
    bumpCombo(container, combo, 'CHEMISTRY');
    (isA ? fighterA : fighterB)?.classList.add(isA ? 'makeout-lean-a' : 'makeout-lean-b');
    (isA ? fighterB : fighterA)?.classList.add('makeout-swoon');
    later(() => {
      fighterA?.classList.remove('makeout-lean-a', 'makeout-swoon');
      fighterB?.classList.remove('makeout-lean-b', 'makeout-swoon');
    }, 420);
    if (fxPunch) {
      fxPunch.textContent = ['💕', '💋', '💗', '✨'][Math.floor(Math.random() * 4)];
      fxPunch.classList.add('pop-fx');
      later(() => fxPunch.classList.remove('pop-fx'), 320);
    }
    if (fxText) {
      fxText.textContent = ['MWAAH', 'HMM', 'OYE', 'SHH'][Math.floor(Math.random() * 4)];
      fxText.classList.add('pop-text');
      later(() => fxText.classList.remove('pop-text'), 320);
    }
    playSound('kiss_smooch');
    if (combo % 2 === 0) playSound('heartbeat');
    if (combo === 3) playSound('breath');
  }

  function finish(early) {
    if (done) return;
    done = true;
    fighterA?.classList.add('winner-celebrate', 'makeout-lock');
    fighterB?.classList.add('winner-celebrate', 'makeout-lock');
    heartsRain?.classList.add('show-hearts');
    lipstick?.classList.add('show-lips');
    combatVerdict?.classList.add('show-verdict');
    playSound(early ? 'kiss_smooch' : 'cheer');
    later(() => onDone?.(), 1800);
  }

  wireSkip(container, timers, () => finish(true));

  later(() => {
    bubbleA?.classList.add('show-bubble');
    bubbleB?.classList.add('show-bubble');
    playSound('sultry_whisper');
    playSound('heartbeat');
  }, 180);

  later(() => {
    bubbleA?.classList.remove('show-bubble');
    bubbleB?.classList.remove('show-bubble');
    kiss('A');
    setRizz('A', 18);
  }, 800);

  later(() => {
    kiss('B');
    setRizz('B', 16);
    playSound('breath');
  }, 1400);

  later(() => {
    kiss('A');
    setRizz('A', 22);
    heartsRain?.classList.add('show-hearts');
    lipstick?.classList.add('show-lips');
  }, 2000);

  later(() => {
    fighterA?.classList.add('makeout-lock');
    fighterB?.classList.add('makeout-lock');
    kiss('B');
    setRizz('B', 24);
    playSound('sultry_whisper');
  }, 2700);

  later(() => {
    kiss('A');
    if (winner.id === a.id) setRizz('A', 40);
    else setRizz('B', 40);
    playSound('kiss_smooch');
    playSound('heartbeat');
  }, 3600);

  later(() => finish(false), 4600);
}

/* ---------- Dynamic Battle Choreography Execution ---------- */
export function runCombatSequence(container, fight, a, b, aChar, bChar, winner, loser, onDone) {
  if (state.ui.nsfw) {
    runMakeoutSequence(container, a, b, winner, loser, onDone);
    return;
  }

  const isBaddieFight = aChar === 'baddie' || bChar === 'baddie';
  const hpAFill = container.querySelector('#hpAFill');
  const hpBFill = container.querySelector('#hpBFill');
  const hpAVal = container.querySelector('#hpAVal');
  const hpBVal = container.querySelector('#hpBVal');
  const fighterA = container.querySelector('#fighterA');
  const fighterB = container.querySelector('#fighterB');
  const bubbleA = container.querySelector('#bubbleA');
  const bubbleB = container.querySelector('#bubbleB');
  const fxPunch = container.querySelector('#fxPunch');
  const fxText = container.querySelector('#fxText');
  const hairPullFx = container.querySelector('#hairPullFx');
  const combatVerdict = container.querySelector('#combatVerdict');
  const flash = container.querySelector('#impactFlash');
  const fistA = container.querySelector('#fistA');
  const fistB = container.querySelector('#fistB');
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let combo = 0;
  let done = false;

  let hpA = 100;
  let hpB = 100;

  function updateHp(target, damage) {
    if (target === 'A') {
      hpA = Math.max(0, hpA - damage);
      if (hpAFill) hpAFill.style.width = `${hpA}%`;
      if (hpAVal) hpAVal.textContent = `${hpA}%`;
      if (hpA <= 30 && hpAFill) hpAFill.style.background = '#ff4d40';
    } else {
      hpB = Math.max(0, hpB - damage);
      if (hpBFill) hpBFill.style.width = `${hpB}%`;
      if (hpBVal) hpBVal.textContent = `${hpB}%`;
      if (hpB <= 30 && hpBFill) hpBFill.style.background = '#ff4d40';
    }
  }

  function triggerHit(attacker, hitType, comicWord) {
    const isAttackerA = attacker === 'A';
    const targetEl = isAttackerA ? fighterB : fighterA;
    const attackerEl = isAttackerA ? fighterA : fighterB;
    combo += 1;
    bumpCombo(container, combo, 'COMBO');
    shakeArena(container);
    flash?.classList.add('go');
    later(() => flash?.classList.remove('go'), 120);

    const fist = isAttackerA ? fistA : fistB;
    fist?.classList.add('throw');
    later(() => fist?.classList.remove('throw'), 280);

    attackerEl?.classList.add(isAttackerA ? 'punch-strike-a' : 'punch-strike-b');
    later(() => attackerEl?.classList.remove('punch-strike-a', 'punch-strike-b'), 280);
    targetEl?.classList.add('hit-recoil');
    later(() => targetEl?.classList.remove('hit-recoil'), 280);

    if (fxPunch) {
      fxPunch.textContent = hitType === 'slap' ? '👋' : hitType === 'hair' ? '💇‍♀️' : '💥';
      fxPunch.classList.add('pop-fx');
      later(() => fxPunch.classList.remove('pop-fx'), 300);
    }
    if (fxText) {
      fxText.textContent = comicWord || 'POW!';
      fxText.classList.add('pop-text');
      later(() => fxText.classList.remove('pop-text'), 320);
    }

    if (hitType === 'slap') playSound('slap');
    else if (hitType === 'hair') playSound('hair_pull');
    else if (hitType === 'honk') playSound('honk');
    else playSound('punch');
  }

  function finish(early) {
    if (done) return;
    done = true;
    const isWinnerA = winner.id === a.id;
    if (isWinnerA) {
      fighterB?.classList.add('loser-knockout');
      fighterA?.classList.add('winner-celebrate');
      updateHp('B', 100);
    } else {
      fighterA?.classList.add('loser-knockout');
      fighterB?.classList.add('winner-celebrate');
      updateHp('A', 100);
    }
    combatVerdict?.classList.add('show-verdict');
    playSound(early ? 'ko' : 'cheer');
    later(() => onDone?.(), 1800);
  }

  wireSkip(container, timers, () => finish(true));

  later(() => {
    bubbleA?.classList.add('show-bubble');
    bubbleB?.classList.add('show-bubble');
    playSound('whoosh');
  }, 160);

  later(() => {
    bubbleA?.classList.remove('show-bubble');
    bubbleB?.classList.remove('show-bubble');
    triggerHit('A', 'punch', 'DHISHUM!');
    updateHp('B', 14);
  }, 700);

  later(() => {
    triggerHit('B', 'punch', 'FATAK!');
    updateHp('A', 12);
  }, 1100);

  later(() => {
    triggerHit('A', aChar === 'baddie' ? 'slap' : 'punch', aChar === 'baddie' ? 'CHATAAK!' : 'BOOM!');
    updateHp('B', 16);
  }, 1500);

  later(() => {
    triggerHit('B', 'punch', 'UPPERCUT!');
    updateHp('A', 14);
  }, 1900);

  later(() => {
    if (isBaddieFight) {
      hairPullFx?.classList.add('show-hair-pull');
      fighterA?.classList.add('hair-pull-lock');
      fighterB?.classList.add('hair-pull-lock');
      triggerHit('B', 'hair', 'CHOTI PULL!');
      updateHp('A', 18);
      if (bubbleA) {
        bubbleA.textContent = getShout(aChar, false);
        bubbleA.classList.add('show-bubble');
      }
    } else if (aChar === 'chapri' || bChar === 'chapri') {
      triggerHit('A', 'punch', '🩴 CHAPPAL TOSS!');
      updateHp('B', 20);
    } else if (aChar === 'traffic' || bChar === 'traffic') {
      triggerHit('B', 'honk', '📢 BEEP BEEP!');
      updateHp('A', 18);
    } else {
      triggerHit('A', 'punch', '⚡ DUMBBELL SMASH!');
      updateHp('B', 20);
    }
  }, 2400);

  later(() => {
    hairPullFx?.classList.remove('show-hair-pull');
    fighterA?.classList.remove('hair-pull-lock');
    fighterB?.classList.remove('hair-pull-lock');
    bubbleA?.classList.remove('show-bubble');
    if (winner.id === a.id) {
      triggerHit('A', isBaddieFight ? 'slap' : 'punch', 'NAIL SLAP!');
      updateHp('B', 18);
    } else {
      triggerHit('B', isBaddieFight ? 'slap' : 'punch', 'EXTENSIONS EXTRACTED!');
      updateHp('A', 18);
    }
  }, 3100);

  later(() => {
    triggerHit(winner.id === a.id ? 'A' : 'B', isBaddieFight ? 'slap' : 'punch', '💥 ULTRA K.O.!');
    playSound('ko');
  }, 3800);

  later(() => finish(false), 4500);
}
