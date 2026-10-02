/*! Calculas Typing app - functional UI layer for the existing engine/content/sound modules. */
(function () {
  'use strict';

  var state = {
    duration: 30,
    mode: 'standard',
    engine: null,
    timerId: null,
    soundEnabled: false,
    volume: 55,
    finished: false,
    started: false,
    words: []
  };

  var DOM = {};

  function cacheDom() {
    DOM.heroVideo = document.getElementById('heroVideo');
    DOM.startButton = document.getElementById('start-typing');
    DOM.testSection = document.getElementById('typing-test');
  }

  function buildTestUI() {
    if (!DOM.testSection || DOM.testSection.dataset.ready === '1') return;

    DOM.testSection.innerHTML = [
      '<div class="wrap tt-wrap">',
        '<div class="tt">',
          '<div class="tt-bar">',
            '<div class="chips" role="group" aria-label="Typing mode">',
              '<button type="button" class="chip mode active" data-mode="standard" aria-pressed="true">Standard</button>',
              '<button type="button" class="chip mode" data-mode="numbers" aria-pressed="false">Numbers</button>',
              '<button type="button" class="chip mode" data-mode="punctuation" aria-pressed="false">Punctuation</button>',
            '</div>',
            '<div class="tog">',
              '<button type="button" class="chip" id="sound-toggle" aria-pressed="false" aria-label="Typing sound: off, click to turn on">🔇</button>',
            '</div>',
            '<label class="cd" for="sound-vol">',
              '<span class="st-l">Volume</span>',
              '<input id="sound-vol" type="range" min="0" max="100" step="1" value="55" aria-label="Typing sound volume">',
            '</label>',
          '</div>',

          '<div class="tt-stats" aria-live="polite">',
            '<div class="st"><span class="st-v" data-s="time">00:30</span><span class="st-l">TIME</span></div>',
            '<div class="st"><span class="st-v" data-s="wpm">0</span><span class="st-l">WPM</span></div>',
            '<div class="st"><span class="st-v" data-s="acc">100%</span><span class="st-l">ACCURACY</span></div>',
            '<div class="st"><span class="st-v" data-s="bad">0</span><span class="st-l">ERRORS</span></div>',
          '</div>',

          '<div class="tt-progress" aria-hidden="true"><i id="progress-bar"></i></div>',

          '<div class="tt-area" id="typing-area">',
            '<div class="tt-text" id="passage" aria-hidden="true"></div>',
            '<textarea class="tt-input" id="typing-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the displayed passage"></textarea>',
          '</div>',

          '<p class="tt-hint">Click the text and start typing. The 30-second timer begins with your first key.</p>',
          '<p class="touch-note">For the best experience, use a physical keyboard.</p>',

          '<div class="tt-result" hidden aria-live="polite">',
            '<div class="res-main">',
              '<div><strong data-r="wpm">0</strong><span>WPM</span></div>',
              '<div><strong data-r="acc">100%</strong><span>Accuracy</span></div>',
            '</div>',
            '<dl class="res-grid">',
              '<div><dt>Errors</dt><dd data-r="bad">0</dd></div>',
              '<div><dt>Mode</dt><dd data-r="mode">Standard</dd></div>',
              '<div><dt>Duration</dt><dd data-r="duration">30.0s</dd></div>',
            '</dl>',
            '<p class="res-note" data-r="note">Keep a steady rhythm and focus on accuracy.</p>',
            '<div class="res-actions">',
              '<button type="button" class="btn primary" data-act="again">Try again</button>',
              '<button type="button" class="btn" data-act="new">New test</button>',
            '</div>',
          '</div>',
        '</div>',

        '<section class="section" aria-labelledby="progress-heading">',
          '<div class="section-heading">',
            '<div class="eyebrow">PROGRESS</div>',
            '<h2 id="progress-heading">Your recent typing</h2>',
          '</div>',
          '<div class="grid">',
            '<div class="metric-panel"><span class="st-l">Best WPM</span><div class="st-v" id="bestWpm">0</div></div>',
            '<div class="metric-panel"><span class="st-l">Tests completed</span><div class="st-v" id="testCount">0</div></div>',
          '</div>',
          '<div class="metric-panel"><span class="st-l">History</span><div id="history"><p>No completed tests yet.</p></div></div>',
        '</section>',
      '</div>'
    ].join('');

    DOM.testSection.dataset.ready = '1';
  }

  function cacheTestDom() {
    DOM.modeButtons = document.querySelectorAll('#typing-test .mode');
    DOM.soundToggle = document.getElementById('sound-toggle');
    DOM.volumeSlider = document.getElementById('sound-vol');
    DOM.passage = document.getElementById('passage');
    DOM.typingInput = document.getElementById('typing-input');
    DOM.typingArea = document.getElementById('typing-area');
    DOM.time = document.querySelector('#typing-test .tt-stats .st-v[data-s="time"]');
    DOM.wpm = document.querySelector('#typing-test .tt-stats .st-v[data-s="wpm"]');
    DOM.accuracy = document.querySelector('#typing-test .tt-stats .st-v[data-s="acc"]');
    DOM.errors = document.querySelector('#typing-test .tt-stats .st-v[data-s="bad"]');
    DOM.progress = document.getElementById('progress-bar');
    DOM.result = document.querySelector('#typing-test .tt-result');
    DOM.resultWpm = document.querySelector('[data-r="wpm"]');
    DOM.resultAcc = document.querySelector('[data-r="acc"]');
    DOM.resultBad = document.querySelector('[data-r="bad"]');
    DOM.resultMode = document.querySelector('[data-r="mode"]');
    DOM.resultDuration = document.querySelector('[data-r="duration"]');
    DOM.resultNote = document.querySelector('[data-r="note"]');
    DOM.again = document.querySelector('[data-act="again"]');
    DOM.newTest = document.querySelector('[data-act="new"]');
    DOM.history = document.getElementById('history');
    DOM.bestWpm = document.getElementById('bestWpm');
    DOM.testCount = document.getElementById('testCount');
  }

  function setHeroVideo() {
    if (!DOM.heroVideo) return;

    function resize() {
      DOM.heroVideo.style.height = window.innerHeight + 'px';
    }

    resize();
    window.addEventListener('resize', resize);

    DOM.heroVideo.muted = true;
    DOM.heroVideo.defaultMuted = true;

    var playPromise = DOM.heroVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function setupStartButton() {
    if (!DOM.startButton) return;

    DOM.startButton.addEventListener('click', function (event) {
      event.preventDefault();

      resetTest(state.mode, true);

      var target = document.getElementById('typing-test');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      focusInput(220);
    });
  }

  function setupModeButtons() {
    DOM.modeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.mode = this.getAttribute('data-mode') || 'standard';

        DOM.modeButtons.forEach(function (item) {
          var active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });

        resetTest(state.mode, true);
        focusInput(80);
      });
    });
  }

  function setupSoundControls() {
    state.soundEnabled = CalculasSound.isEnabled();
    state.volume = CalculasSound.getVolume();

    if (DOM.soundToggle) {
      updateSoundButton();

      DOM.soundToggle.addEventListener('click', function () {
        state.soundEnabled = !state.soundEnabled;
        CalculasSound.setEnabled(state.soundEnabled);
        updateSoundButton();
      });
    }

    if (DOM.volumeSlider) {
      DOM.volumeSlider.value = String(state.volume);

      DOM.volumeSlider.addEventListener('input', function () {
        state.volume = Number(this.value);
        CalculasSound.setVolume(state.volume);
      });
    }
  }

  function updateSoundButton() {
    if (!DOM.soundToggle) return;

    DOM.soundToggle.textContent = state.soundEnabled ? '🔊' : '🔇';
    DOM.soundToggle.setAttribute('aria-pressed', String(state.soundEnabled));
    DOM.soundToggle.setAttribute(
      'aria-label',
      state.soundEnabled
        ? 'Typing sound: on, click to mute'
        : 'Typing sound: off, click to turn on'
    );
  }

  function setupTestControls() {
    if (DOM.again) {
      DOM.again.addEventListener('click', function () {
        resetTest(state.mode, true);
        focusInput(50);
      });
    }

    if (DOM.newTest) {
      DOM.newTest.addEventListener('click', function () {
        resetTest(state.mode, true);
        focusInput(50);
      });
    }
  }

  function setupTypingInput() {
    if (!DOM.typingInput) return;

    DOM.typingInput.addEventListener('keydown', function (event) {
      if (state.finished || !state.engine) return;

      if (event.key === 'Tab' || (event.ctrlKey && event.key.toLowerCase() === 'r')) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        resetTest(state.mode, true);
        return;
      }

      var now = performance.now();

      if (event.key === 'Backspace') {
        event.preventDefault();

        if (state.engine.backspace()) {
          if (state.soundEnabled) CalculasSound.back();
          DOM.typingInput.value = state.engine.buffer();
          renderHighlight();
          updateStats(now);
        }

        return;
      }

      if (event.key === ' ') {
        event.preventDefault();

        if (state.engine.space(now)) {
          if (state.soundEnabled) CalculasSound.space();
          DOM.typingInput.value = state.engine.buffer();
          startTimerIfNeeded();
          renderHighlight();
          updateStats(now);
          checkCompletion();
        }

        return;
      }

      if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      event.preventDefault();

      var accepted = state.engine.input(event.key, now);

      if (accepted) {
        if (state.soundEnabled) CalculasSound.key();
        DOM.typingInput.value = state.engine.buffer();
        startTimerIfNeeded();
        renderHighlight();
        updateStats(now);
        checkCompletion();
      }
    });

    DOM.typingInput.addEventListener('paste', function (event) {
      event.preventDefault();
    });

    DOM.typingInput.addEventListener('input', function () {
      /*
       * The typing engine is intentionally driven by keydown so that
       * every character can be evaluated individually.
       */
      DOM.typingInput.value = state.engine ? state.engine.buffer() : '';
    });
  }

  function makeWordsForMode(mode) {
    var source;

    if (typeof CalculasContent !== 'undefined') {
      if (mode === 'numbers' && typeof CalculasContent.numbers === 'function') {
        source = CalculasContent.numbers();
      } else if (
        mode === 'punctuation' &&
        typeof CalculasContent.punctuation === 'function'
      ) {
        source = CalculasContent.punctuation();
      } else if (typeof CalculasContent.standard === 'function') {
        source = CalculasContent.standard();
      }
    }

    if (Array.isArray(source)) {
      return source.join(' ').trim().split(/\s+/).filter(Boolean);
    }

    if (typeof source === 'string' && source.trim()) {
      return source.trim().split(/\s+/).filter(Boolean);
    }

    return [
      'typing',
      'practice',
      'helps',
      'you',
      'build',
      'speed',
      'accuracy',
      'focus',
      'and',
      'confidence',
      'one',
      'steady',
      'keystroke',
      'at',
      'a',
      'time'
    ];
  }

  function createEngine(words) {
    if (typeof CalculasEngine !== 'function') {
      console.error('[Calculas Typing] CalculasEngine is not available.');
      return null;
    }

    /*
     * Support the existing engine constructor without changing its API.
     * The exact object shape is kept minimal and compatible.
     */
    try {
      return new CalculasEngine({
        words: words,
        duration: state.duration,
        mode: state.mode
      });
    } catch (firstError) {
      try {
        return CalculasEngine(words, {
          duration: state.duration,
          mode: state.mode
        });
      } catch (secondError) {
        console.error(
          '[Calculas Typing] Unable to create CalculasEngine:',
          firstError,
          secondError
        );
        return null;
      }
    }
  }

  function resetTest(mode, showTyping) {
    state.mode = mode || 'standard';
    state.finished = false;
    state.started = false;
    stopTimer();

    state.words = makeWordsForMode(state.mode);
    state.engine = createEngine(state.words);

    if (DOM.result) {
      DOM.result.hidden = true;
    }

    if (DOM.typingInput) {
      DOM.typingInput.value = '';
    }

    renderPassage();
    resetStats();

    if (showTyping && DOM.typingInput) {
      focusInput(50);
    }
  }

  function resetStats() {
    if (DOM.time) DOM.time.textContent = '00:30';
    if (DOM.wpm) DOM.wpm.textContent = '0';
    if (DOM.accuracy) DOM.accuracy.textContent = '100%';
    if (DOM.errors) DOM.errors.textContent = '0';

    if (DOM.progress) {
      DOM.progress.style.width = '0%';
    }
  }

  function renderPassage() {
    if (!DOM.passage) return;

    DOM.passage.innerHTML = '';

    state.words.forEach(function (word, wordIndex) {
      var wordSpan = document.createElement('span');
      wordSpan.className = 'w';
      wordSpan.dataset.word = String(wordIndex);

      for (var i = 0; i < word.length; i++) {
        var charSpan = document.createElement('span');
        charSpan.className = 'c';
        charSpan.textContent = word.charAt(i);
        wordSpan.appendChild(charSpan);
      }

      DOM.passage.appendChild(wordSpan);

      if (wordIndex < state.words.length - 1) {
        DOM.passage.appendChild(document.createTextNode(' '));
      }
    });

    renderHighlight();
  }

  function renderHighlight() {
    if (!state.engine) return;

    var currentIndex = state.engine.index();
    var currentBuffer = state.engine.buffer();
    var spans = DOM.passage.querySelectorAll('.w');

    spans.forEach(function (wordElement, wordIndex) {
      wordElement.classList.remove('end');

      var chars = wordElement.querySelectorAll('.c');

      chars.forEach(function (charElement, charIndex) {
        charElement.className = 'c';

        if (wordIndex < currentIndex) {
          charElement.classList.add('ok');
          return;
        }

        if (wordIndex !== currentIndex) return;

        if (charIndex < currentBuffer.length) {
          charElement.classList.add(
            currentBuffer.charAt(charIndex) ===
              state.words[wordIndex].charAt(charIndex)
              ? 'ok'
              : 'no'
          );
        } else if (charIndex === currentBuffer.length) {
          charElement.classList.add('cur');
        }
      });

      if (
        wordIndex === currentIndex &&
        currentBuffer.length >= state.words[wordIndex].length
      ) {
        wordElement.classList.add('end');
      }
    });

    var currentWord = DOM.passage.querySelector(
      '.w:nth-of-type(' + (currentIndex + 1) + ')'
    );

    if (currentWord && currentWord.scrollIntoView) {
      var containerRect = DOM.passage.getBoundingClientRect();
      var wordRect = currentWord.getBoundingClientRect();

      if (
        wordRect.bottom > containerRect.bottom - 10 ||
        wordRect.top < containerRect.top + 10
      ) {
        currentWord.scrollIntoView({ block: 'center' });
      }
    }
  }

  function focusInput(delay) {
    var wait = typeof delay === 'number' ? delay : 0;

    window.setTimeout(function () {
      if (DOM.typingInput) {
        DOM.typingInput.focus({ preventScroll: true });
      }
    }, wait);
  }

  function startTimerIfNeeded() {
    if (state.started || !state.engine || !state.engine.started()) return;

    state.started = true;
    state.finished = false;
    stopTimer();

    state.timerId = window.setInterval(function () {
      var now = performance.now();

      updateStats(now);

      if (state.engine.tick(now)) {
        finishTest();
      }
    }, 100);
  }

  function stopTimer() {
    if (state.timerId !== null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function updateStats(now) {
    if (!state.engine) return;

    var snapshot = state.engine.snapshot(now);
    var elapsed = snapshot.elapsed;

    var remaining = Math.max(
      0,
      Math.ceil((state.duration * 1000 - elapsed) / 1000)
    );

    var seconds = remaining % 60;
    var minutes = Math.floor(remaining / 60);

    DOM.time.textContent =
      (minutes > 0
        ? String(minutes).padStart(2, '0') + ':'
        : '00:') +
      String(seconds).padStart(2, '0');

    DOM.wpm.textContent = String(
      Math.max(0, Math.round(snapshot.wpm))
    );

    DOM.accuracy.textContent =
      Math.max(0, Math.min(100, Math.round(snapshot.accuracy))) + '%';

    DOM.errors.textContent = String(snapshot.errors);

    var completedWords =
      snapshot.words +
      (state.engine.buffer().length > 0 ? 0.5 : 0);

    var percent = Math.max(
      0,
      Math.min(
        100,
        (completedWords / Math.max(1, state.words.length)) * 100
      )
    );

    DOM.progress.style.width = percent + '%';
  }

  function checkCompletion() {
    if (!state.engine || state.finished) return;

    if (
      typeof state.engine.finished === 'function' &&
      state.engine.finished()
    ) {
      finishTest();
      return;
    }

    if (
      typeof state.engine.complete === 'function' &&
      state.engine.complete()
    ) {
      finishTest();
    }
  }

  function finishTest() {
    if (state.finished || !state.engine) return;

    state.finished = true;
    stopTimer();

    var snapshot = state.engine.snapshot(performance.now());

    var wpm = Math.max(0, Math.round(snapshot.wpm));
    var accuracy = Math.max(
      0,
      Math.min(100, Math.round(snapshot.accuracy))
    );

    var duration = (snapshot.elapsed / 1000).toFixed(1);

    DOM.resultWpm.textContent = String(wpm);
    DOM.resultAcc.textContent = accuracy + '%';
    DOM.resultBad.textContent = String(snapshot.errors);

    DOM.resultMode.textContent =
      state.mode.charAt(0).toUpperCase() + state.mode.slice(1);

    DOM.resultDuration.textContent = duration + 's';

    DOM.resultNote.textContent =
      accuracy >= 95
        ? 'Excellent accuracy. Keep the rhythm steady.'
        : 'Focus on clean, accurate keystrokes before chasing speed.';

    DOM.result.hidden = false;

    saveResult(
      wpm,
      accuracy,
      snapshot.errors,
      duration,
      state.mode
    );

    DOM.result.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }

  function readHistory() {
    try {
      var raw = localStorage.getItem('calculasTypingHistory');
      var parsed = raw ? JSON.parse(raw) : [];

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveResult(wpm, accuracy, errors, duration, mode) {
    var history = readHistory();

    history.unshift({
      wpm: wpm,
      accuracy: accuracy + '%',
      errors: errors,
      duration: duration,
      mode: mode,
      date: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    });

    history = history.slice(0, 20);

    try {
      localStorage.setItem(
        'calculasTypingHistory',
        JSON.stringify(history)
      );
    } catch (error) {
      // Local storage is optional.
    }

    renderHistory(history);
  }

  function renderHistory(history) {
    var items = history || readHistory();

    DOM.testCount.textContent = String(items.length);

    var best = items.length
      ? Math.max.apply(
          null,
          items.map(function (item) {
            return Number(item.wpm) || 0;
          })
        )
      : 0;

    DOM.bestWpm.textContent = String(best);
    DOM.history.innerHTML = '';

    if (!items.length) {
      DOM.history.innerHTML = '<p>No completed tests yet.</p>';
      return;
    }

    items.slice(0, 8).forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'history-item';

      row.textContent =
        String(item.wpm) +
        ' WPM · ' +
        String(item.accuracy) +
        ' · ' +
        String(item.errors) +
        ' errors · ' +
        String(item.date);

      DOM.history.appendChild(row);
    });
  }

  function init() {
    cacheDom();

    buildTestUI();
    cacheTestDom();

    setHeroVideo();
    setupStartButton();
    setupModeButtons();
    setupSoundControls();
    setupTestControls();
    setupTypingInput();

    renderHistory();
    resetTest('standard', false);

    window.addEventListener('pageshow', function () {
      focusInput(0);
    });

    console.log('[Calculas Typing] Initialized successfully.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();