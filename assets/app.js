
/*! Calculas Typing app - dedicated typing test controller. */
(function () {
  'use strict';

  var state = {
    duration: 30,
    mode: 'standard',
    engine: null,
    timerId: null,
    finished: false,
    started: false,
    words: []
  };

  var DOM = {};

  function cacheDom() {
    DOM.testSection = document.getElementById('typing-test');
  }

  function buildTestUI() {
    if (!DOM.testSection) return;

    DOM.testSection.innerHTML = [
      '<div class="wrap tt-wrap">',
        '<div class="tt">',

          '<div class="tt-bar">',

            '<div class="chips" role="group" aria-label="Typing mode">',

              '<button type="button" class="chip mode active" data-mode="standard" aria-pressed="true">',
                'Standard',
              '</button>',

              '<button type="button" class="chip mode" data-mode="numbers" aria-pressed="false">',
                'Numbers',
              '</button>',

              '<button type="button" class="chip mode" data-mode="punctuation" aria-pressed="false">',
                'Punctuation',
              '</button>',

            '</div>',

            '<div class="tog">',
              '<button type="button" class="chip" id="sound-toggle" aria-pressed="false" aria-label="Typing sound off">',
                '🔇',
              '</button>',
            '</div>',

            '<label class="cd" for="sound-vol">',
              '<span class="st-l">Volume</span>',
              '<input id="sound-vol" type="range" min="0" max="100" step="1" value="55" aria-label="Typing sound volume">',
            '</label>',

          '</div>',

          '<div class="tt-stats" aria-live="polite">',

            '<div class="st">',
              '<span class="st-v" data-s="time">00:30</span>',
              '<span class="st-l">TIME</span>',
            '</div>',

            '<div class="st">',
              '<span class="st-v" data-s="wpm">0</span>',
              '<span class="st-l">WPM</span>',
            '</div>',

            '<div class="st">',
              '<span class="st-v" data-s="acc">100%</span>',
              '<span class="st-l">ACCURACY</span>',
            '</div>',

            '<div class="st">',
              '<span class="st-v" data-s="bad">0</span>',
              '<span class="st-l">ERRORS</span>',
            '</div>',

          '</div>',

          '<div class="tt-progress" aria-hidden="true">',
            '<i id="progress-bar"></i>',
          '</div>',

          '<div class="tt-area" id="typing-area">',

            '<div class="tt-text" id="passage" aria-hidden="true"></div>',

            '<textarea',
              ' class="tt-input"',
              ' id="typing-input"',
              ' autocomplete="off"',
              ' autocapitalize="off"',
              ' autocorrect="off"',
              ' spellcheck="false"',
              ' aria-label="Type the displayed passage"',
            '></textarea>',

          '</div>',

          '<p class="tt-hint">',
            'Click the text and start typing. The 30-second timer begins with your first key.',
          '</p>',

          '<p class="touch-note">',
            'For the best experience, use a physical keyboard.',
          '</p>',

          '<div class="tt-result" hidden aria-live="polite">',

            '<div class="res-main">',

              '<div>',
                '<strong data-r="wpm">0</strong>',
                '<span>WPM</span>',
              '</div>',

              '<div>',
                '<strong data-r="acc">100%</strong>',
                '<span>Accuracy</span>',
              '</div>',

            '</div>',

            '<dl class="res-grid">',

              '<div>',
                '<dt>Errors</dt>',
                '<dd data-r="bad">0</dd>',
              '</div>',

              '<div>',
                '<dt>Mode</dt>',
                '<dd data-r="mode">Standard</dd>',
              '</div>',

              '<div>',
                '<dt>Duration</dt>',
                '<dd data-r="duration">30.0s</dd>',
              '</div>',

            '</dl>',

            '<p class="res-note" data-r="note">',
              'Keep a steady rhythm and focus on accuracy.',
            '</p>',

            '<div class="res-actions">',

              '<button type="button" class="btn primary" data-act="again">',
                'Try again',
              '</button>',

              '<a href="index.html" class="btn">',
                'Home',
              '</a>',

            '</div>',

          '</div>',

        '</div>',

        '<section class="section" aria-labelledby="progress-heading">',

          '<div class="section-heading">',
            '<div class="eyebrow">PROGRESS</div>',
            '<h2 id="progress-heading">Your recent typing</h2>',
          '</div>',

          '<div class="grid">',

            '<div class="metric-panel">',
              '<span class="st-l">Best WPM</span>',
              '<div class="st-v" id="bestWpm">0</div>',
            '</div>',

            '<div class="metric-panel">',
              '<span class="st-l">Tests completed</span>',
              '<div class="st-v" id="testCount">0</div>',
            '</div>',

          '</div>',

          '<div class="metric-panel">',

            '<span class="st-l">History</span>',

            '<div id="history">',
              '<p>No completed tests yet.</p>',
            '</div>',

          '</div>',

        '</section>',

      '</div>'
    ].join('');
  }

  function cacheTestDom() {
    DOM.modeButtons = document.querySelectorAll(
      '#typing-test .mode'
    );

    DOM.soundToggle =
      document.getElementById('sound-toggle');

    DOM.volumeSlider =
      document.getElementById('sound-vol');

    DOM.passage =
      document.getElementById('passage');

    DOM.typingInput =
      document.getElementById('typing-input');

    DOM.typingArea =
      document.getElementById('typing-area');

    DOM.time =
      document.querySelector(
        '#typing-test .tt-stats [data-s="time"]'
      );

    DOM.wpm =
      document.querySelector(
        '#typing-test .tt-stats [data-s="wpm"]'
      );

    DOM.accuracy =
      document.querySelector(
        '#typing-test .tt-stats [data-s="acc"]'
      );

    DOM.errors =
      document.querySelector(
        '#typing-test .tt-stats [data-s="bad"]'
      );

    DOM.progress =
      document.getElementById('progress-bar');

    DOM.result =
      document.querySelector(
        '#typing-test .tt-result'
      );

    DOM.resultWpm =
      document.querySelector(
        '[data-r="wpm"]'
      );

    DOM.resultAcc =
      document.querySelector(
        '[data-r="acc"]'
      );

    DOM.resultBad =
      document.querySelector(
        '[data-r="bad"]'
      );

    DOM.resultMode =
      document.querySelector(
        '[data-r="mode"]'
      );

    DOM.resultDuration =
      document.querySelector(
        '[data-r="duration"]'
      );

    DOM.resultNote =
      document.querySelector(
        '[data-r="note"]'
      );

    DOM.again =
      document.querySelector(
        '[data-act="again"]'
      );

    DOM.history =
      document.getElementById('history');

    DOM.bestWpm =
      document.getElementById('bestWpm');

    DOM.testCount =
      document.getElementById('testCount');
  }

  function setupModes() {
    DOM.modeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.mode =
          this.getAttribute('data-mode') ||
          'standard';

        DOM.modeButtons.forEach(function (item) {
          var active = item === button;

          item.classList.toggle(
            'active',
            active
          );

          item.setAttribute(
            'aria-pressed',
            String(active)
          );
        });

        resetTest(
          state.mode,
          true
        );
      });
    });
  }

  function setupSoundControls() {
    if (
      typeof CalculasSound ===
      'undefined'
    ) {
      console.warn(
        '[Calculas Typing] CalculasSound is not loaded.'
      );

      return;
    }

    var enabled =
      CalculasSound.isEnabled();

    if (DOM.soundToggle) {
      updateSoundButton(enabled);

      DOM.soundToggle.addEventListener(
        'click',
        function () {
          enabled = !enabled;

          CalculasSound.setEnabled(
            enabled
          );

          updateSoundButton(
            enabled
          );
        }
      );
    }

    if (DOM.volumeSlider) {
      DOM.volumeSlider.value =
        String(
          CalculasSound.getVolume()
        );

      DOM.volumeSlider.addEventListener(
        'input',
        function () {
          CalculasSound.setVolume(
            Number(this.value)
          );
        }
      );
    }
  }

  function updateSoundButton(enabled) {
    if (!DOM.soundToggle) return;

    DOM.soundToggle.textContent =
      enabled ? '🔊' : '🔇';

    DOM.soundToggle.setAttribute(
      'aria-pressed',
      String(enabled)
    );

    DOM.soundToggle.setAttribute(
      'aria-label',
      enabled
        ? 'Typing sound on, click to mute'
        : 'Typing sound off, click to enable'
    );
  }

  function setupControls() {
    if (DOM.again) {
      DOM.again.addEventListener(
        'click',
        function () {
          resetTest(
            state.mode,
            true
          );
        }
      );
    }

    if (DOM.typingArea) {
      DOM.typingArea.addEventListener(
        'click',
        function () {
          focusInput(0);
        }
      );
    }

    if (DOM.passage) {
      DOM.passage.addEventListener(
        'click',
        function () {
          focusInput(0);
        }
      );
    }
  }

  function setupTypingInput() {
    if (!DOM.typingInput) return;

    DOM.typingInput.addEventListener(
      'keydown',
      function (event) {
        if (
          state.finished ||
          !state.engine
        ) {
          return;
        }

        var now =
          performance.now();

        /*
         * Special keys.
         */
        if (event.key === 'Escape') {
          event.preventDefault();

          resetTest(
            state.mode,
            true
          );

          return;
        }

        if (event.key === 'Backspace') {
          event.preventDefault();

          if (
            typeof state.engine.backspace ===
            'function'
          ) {
            var changed =
              state.engine.backspace();

            if (changed) {
              playSound('back');

              syncInput();
              renderHighlight();
              updateStats(now);
            }
          }

          return;
        }

        if (event.key === ' ') {
          event.preventDefault();

          if (
            typeof state.engine.space ===
            'function'
          ) {
            var moved =
              state.engine.space(now);

            if (moved) {
              playSound('space');

              syncInput();
              startTimerIfNeeded();
              renderHighlight();
              updateStats(now);
              checkCompletion();
            }
          }

          return;
        }

        /*
         * Ignore modifier/navigation keys.
         */
        if (
          event.key.length !== 1 ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey
        ) {
          return;
        }

        event.preventDefault();

        /*
         * IMPORTANT:
         * The real engine method is .type(),
         * not .input().
         */
        if (
          typeof state.engine.type ===
          'function'
        ) {
          var accepted =
            state.engine.type(
              event.key,
              now
            );

          if (accepted) {
            playSound('key');

            syncInput();
            startTimerIfNeeded();
            renderHighlight();
            updateStats(now);
            checkCompletion();
          }
        }
      }
    );

    DOM.typingInput.addEventListener(
      'paste',
      function (event) {
        event.preventDefault();
      }
    );

    DOM.typingInput.addEventListener(
      'input',
      function () {
        /*
         * Keyboard events are the source of truth.
         * Prevent browser typing from changing the
         * textarea independently of the engine.
         */
        syncInput();
      }
    );
  }

  function syncInput() {
    if (
      DOM.typingInput &&
      state.engine &&
      typeof state.engine.buffer ===
        'function'
    ) {
      DOM.typingInput.value =
        state.engine.buffer();
    }
  }

  function playSound(type) {
    if (
      typeof CalculasSound ===
      'undefined'
    ) {
      return;
    }

    if (
      !CalculasSound.isEnabled()
    ) {
      return;
    }

    if (
      type === 'key' &&
      typeof CalculasSound.key ===
      'function'
    ) {
      CalculasSound.key();
    }

    if (
      type === 'space' &&
      typeof CalculasSound.space ===
      'function'
    ) {
      CalculasSound.space();
    }

    if (
      type === 'back' &&
      typeof CalculasSound.back ===
      'function'
    ) {
      CalculasSound.back();
    }
  }

  function randomItem(list) {
    if (
      !Array.isArray(list) ||
      !list.length
    ) {
      return '';
    }

    return list[
      Math.floor(
        Math.random() *
        list.length
      )
    ];
  }

  function buildWords(mode) {
    if (
      typeof CalculasContent ===
      'undefined'
    ) {
      return [
        'typing',
        'practice',
        'builds',
        'speed',
        'accuracy',
        'focus'
      ];
    }

    /*
     * Standard:
     * Use one of the original paragraphs and
     * repeat/add content when necessary.
     */
    if (mode === 'standard') {
      var paragraph =
        randomItem(
          CalculasContent.paragraphs
        );

      if (
        paragraph &&
        typeof CalculasContent.gen ===
        'object'
      ) {
        var base =
          CalculasContent.gen.clean(
            paragraph
          );

        var words =
          base.slice();

        /*
         * 30 seconds needs enough text.
         */
        while (
          words.length < 90
        ) {
          var extra =
            CalculasContent.gen.clean(
              randomItem(
                CalculasContent.paragraphs
              ) || ''
            );

          words =
            words.concat(
              extra
            );
        }

        return words.slice(
          0,
          140
        );
      }
    }

    /*
     * Numbers.
     */
    if (
      mode === 'numbers' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.numbers ===
        'function'
    ) {
      return CalculasContent.gen.numbers(
        120
      );
    }

    /*
     * Punctuation.
     */
    if (
      mode === 'punctuation' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.punctuate ===
        'function'
    ) {
      var punctuationBase =
        CalculasContent.gen.pick(
          CalculasContent.common,
          120
        );

      return CalculasContent.gen.punctuate(
        punctuationBase
      );
    }

    return [
      'typing',
      'practice',
      'builds',
      'speed',
      'accuracy',
      'focus'
    ];
  }

  /*
   * IMPORTANT:
   * The real engine API is:
   * CalculasEngine.create(words, options)
   */
  function createEngine(words) {
    if (
      typeof CalculasEngine ===
      'undefined'
    ) {
      console.error(
        '[Calculas Typing] CalculasEngine is not loaded.'
      );

      return null;
    }

    if (
      typeof CalculasEngine.create !==
      'function'
    ) {
      console.error(
        '[Calculas Typing] CalculasEngine.create() is missing.'
      );

      return null;
    }

    try {
      return CalculasEngine.create(
        words,
        {
          duration:
            state.duration
        }
      );
    } catch (error) {
      console.error(
        '[Calculas Typing] Engine creation failed:',
        error
      );

      return null;
    }
  }

  function resetTest(
    mode,
    focus
  ) {
    state.mode =
      mode || 'standard';

    state.finished = false;
    state.started = false;

    stopTimer();

    state.words =
      buildWords(
        state.mode
      );

    state.engine =
      createEngine(
        state.words
      );

    if (DOM.result) {
      DOM.result.hidden =
        true;
    }

    if (DOM.typingInput) {
      DOM.typingInput.value =
        '';
    }

    resetStats();
    renderPassage();

    if (focus) {
      focusInput(40);
    }
  }

  function resetStats() {
    if (DOM.time) {
      DOM.time.textContent =
        '00:30';
    }

    if (DOM.wpm) {
      DOM.wpm.textContent =
        '0';
    }

    if (DOM.accuracy) {
      DOM.accuracy.textContent =
        '100%';
    }

    if (DOM.errors) {
      DOM.errors.textContent =
        '0';
    }

    if (DOM.progress) {
      DOM.progress.style.width =
        '0%';
    }
  }

  function renderPassage() {
    if (!DOM.passage) {
      return;
    }

    DOM.passage.innerHTML =
      '';

    state.words.forEach(
      function (
        word,
        wordIndex
      ) {
        var wordElement =
          document.createElement(
            'span'
          );

        wordElement.className =
          'w';

        wordElement.dataset.word =
          String(
            wordIndex
          );

        for (
          var i = 0;
          i < word.length;
          i++
        ) {
          var charElement =
            document.createElement(
              'span'
            );

          charElement.className =
            'c';

          charElement.textContent =
            word.charAt(i);

          wordElement.appendChild(
            charElement
          );
        }

        DOM.passage.appendChild(
          wordElement
        );

        if (
          wordIndex <
          state.words.length - 1
        ) {
          DOM.passage.appendChild(
            document.createTextNode(
              ' '
            )
          );
        }
      }
    );

    renderHighlight();
  }

  function renderHighlight() {
    if (
      !state.engine ||
      !DOM.passage
    ) {
      return;
    }

    if (
      typeof state.engine.index !==
      'function' ||
      typeof state.engine.buffer !==
      'function'
    ) {
      return;
    }

    var currentIndex =
      state.engine.index();

    var buffer =
      state.engine.buffer();

    var wordElements =
      DOM.passage.querySelectorAll(
        '.w'
      );

    wordElements.forEach(
      function (
        wordElement,
        wordIndex
      ) {
        var chars =
          wordElement.querySelectorAll(
            '.c'
          );

        chars.forEach(
          function (
            charElement,
            charIndex
          ) {
            charElement.className =
              'c';

            if (
              wordIndex <
              currentIndex
            ) {
              charElement.classList.add(
                'ok'
              );

              return;
            }

            if (
              wordIndex !==
              currentIndex
            ) {
              return;
            }

            var target =
              state.words[
                wordIndex
              ] || '';

            if (
              charIndex <
              buffer.length
            ) {
              charElement.classList.add(
                buffer.charAt(
                  charIndex
                ) ===
                  target.charAt(
                    charIndex
                  )
                  ? 'ok'
                  : 'no'
              );
            }

            if (
              charIndex ===
              buffer.length
            ) {
              charElement.classList.add(
                'cur'
              );
            }
          }
        );
      }
    );
  }

  function focusInput(delay) {
    window.setTimeout(
      function () {
        if (
          DOM.typingInput
        ) {
          DOM.typingInput.focus({
            preventScroll:
              true
          });
        }
      },
      typeof delay ===
        'number'
        ? delay
        : 0
    );
  }

  function startTimerIfNeeded() {
    if (
      state.started ||
      !state.engine
    ) {
      return;
    }

    /*
     * The engine starts when the first
     * character/space is typed.
     */
    if (
      typeof state.engine.started !==
        'function' ||
      !state.engine.started()
    ) {
      return;
    }

    state.started = true;

    stopTimer();

    state.timerId =
      window.setInterval(
        function () {
          var now =
            performance.now();

          updateStats(now);

          if (
            typeof state.engine.tick ===
              'function' &&
            state.engine.tick(
              now
            )
          ) {
            finishTest();
          }
        },
        100
      );
  }

  function stopTimer() {
    if (
      state.timerId !==
      null
    ) {
      window.clearInterval(
        state.timerId
      );

      state.timerId =
        null;
    }
  }

  function updateStats(now) {
    if (
      !state.engine ||
      typeof state.engine.snapshot !==
        'function'
    ) {
      return;
    }

    var snapshot =
      state.engine.snapshot(
        now
      );

    var elapsed =
      Number(
        snapshot.elapsed
      ) || 0;

    var remaining =
      Math.max(
        0,
        Math.ceil(
          (
            state.duration *
            1000 -
            elapsed
          ) / 1000
        )
      );

    if (DOM.time) {
      DOM.time.textContent =
        '00:' +
        String(
          remaining
        ).padStart(
          2,
          '0'
        );
    }

    if (DOM.wpm) {
      DOM.wpm.textContent =
        String(
          Math.max(
            0,
            Math.round(
              Number(
                snapshot.wpm
              ) || 0
            )
          )
        );
    }

    if (DOM.accuracy) {
      DOM.accuracy.textContent =
        Math.max(
          0,
          Math.min(
            100,
            Math.round(
              Number(
                snapshot.accuracy
              ) || 0
            )
          )
        ) + '%';
    }

    if (DOM.errors) {
      DOM.errors.textContent =
        String(
          Math.max(
            0,
            Number(
              snapshot.errors
            ) || 0
          )
        );
    }

    if (DOM.progress) {
      var completed =
        Number(
          snapshot.words
        ) || 0;

      var total =
        typeof state.engine.count ===
        'function'
          ? state.engine.count()
          : state.words.length;

      var percentage =
        (
          completed /
          Math.max(
            1,
            total
          )
        ) * 100;

      DOM.progress.style.width =
        Math.max(
          0,
          Math.min(
            100,
            percentage
          )
        ) + '%';
    }
  }

  function checkCompletion() {
    if (
      !state.engine ||
      state.finished
    ) {
      return;
    }

    /*
     * The real engine uses isFinished().
     */
    if (
      typeof state.engine.isFinished ===
        'function' &&
      state.engine.isFinished()
    ) {
      finishTest();
    }
  }

  function finishTest() {
    if (
      state.finished ||
      !state.engine
    ) {
      return;
    }

    state.finished = true;

    stopTimer();

    var snapshot =
      state.engine.snapshot(
        performance.now()
      );

    var wpm =
      Math.max(
        0,
        Math.round(
          Number(
            snapshot.wpm
          ) || 0
        )
      );

    var accuracy =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            Number(
              snapshot.accuracy
            ) || 0
          )
        )
      );

    var errors =
      Math.max(
        0,
        Number(
          snapshot.errors
        ) || 0
      );

    var elapsed =
      Number(
        snapshot.elapsed
      ) || 0;

    if (DOM.resultWpm) {
      DOM.resultWpm.textContent =
        String(wpm);
    }

    if (DOM.resultAcc) {
      DOM.resultAcc.textContent =
        accuracy + '%';
    }

    if (DOM.resultBad) {
      DOM.resultBad.textContent =
        String(errors);
    }

    if (DOM.resultMode) {
      DOM.resultMode.textContent =
        state.mode
          .charAt(0)
          .toUpperCase() +
        state.mode.slice(1);
    }

    if (DOM.resultDuration) {
      DOM.resultDuration.textContent =
        (
          elapsed /
          1000
        ).toFixed(1) +
        's';
    }

    if (DOM.resultNote) {
      DOM.resultNote.textContent =
        accuracy >= 95
          ? 'Excellent accuracy. Keep the rhythm steady.'
          : 'Focus on clean, accurate keystrokes before chasing speed.';
    }

    if (DOM.result) {
      DOM.result.hidden =
        false;

      DOM.result.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    saveResult(
      wpm,
      accuracy,
      errors,
      elapsed,
      state.mode
    );
  }

  function readHistory() {
    try {
      var raw =
        localStorage.getItem(
          'calculasTypingHistory'
        );

      var parsed =
        raw
          ? JSON.parse(raw)
          : [];

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch (error) {
      return [];
    }
  }

  function saveResult(
    wpm,
    accuracy,
    errors,
    elapsed,
    mode
  ) {
    var history =
      readHistory();

    history.unshift({
      wpm: wpm,
      accuracy:
        accuracy + '%',
      errors: errors,
      duration:
        (
          elapsed /
          1000
        ).toFixed(1),
      mode: mode,
      date:
        new Date()
          .toLocaleTimeString(
            [],
            {
              hour:
                '2-digit',
              minute:
                '2-digit'
            }
          )
    });

    history =
      history.slice(
        0,
        20
      );

    try {
      localStorage.setItem(
        'calculasTypingHistory',
        JSON.stringify(
          history
        )
      );
    } catch (error) {
      /* localStorage is optional */
    }

    renderHistory(
      history
    );
  }

  function renderHistory(
    history
  ) {
    if (!DOM.history) {
      return;
    }

    var items =
      history ||
      readHistory();

    if (DOM.testCount) {
      DOM.testCount.textContent =
        String(
          items.length
        );
    }

    var best =
      items.length
        ? Math.max.apply(
            null,
            items.map(
              function (
                item
              ) {
                return Number(
                  item.wpm
                ) || 0;
              }
            )
          )
        : 0;

    if (DOM.bestWpm) {
      DOM.bestWpm.textContent =
        String(best);
    }

    DOM.history.innerHTML =
      '';

    if (!items.length) {
      DOM.history.innerHTML =
        '<p>No completed tests yet.</p>';

      return;
    }

    items
      .slice(
        0,
        8
      )
      .forEach(
        function (
          item
        ) {
          var row =
            document.createElement(
              'div'
            );

          row.className =
            'history-item';

          row.textContent =
            String(
              item.wpm
            ) +
            ' WPM · ' +
            String(
              item.accuracy
            ) +
            ' · ' +
            String(
              item.errors
            ) +
            ' errors · ' +
            String(
              item.date
            );

          DOM.history.appendChild(
            row
          );
        }
      );
  }

  function init() {
    cacheDom();

    if (!DOM.testSection) {
      return;
    }

    buildTestUI();
    cacheTestDom();

    setupModes();
    setupSoundControls();
    setupControls();
    setupTypingInput();

    renderHistory();

    resetTest(
      'standard',
      false
    );

    console.log(
      '[Calculas Typing] Dedicated typing test initialized.'
    );
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init
    );
  } else {
    init();
  }
})();

