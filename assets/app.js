/*! Calculas Typing app - dedicated typing test controller. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Application state                                                   */
  /* ------------------------------------------------------------------ */

  var CONFIG = {
    defaultDuration: 30,
    durations: [15, 30, 60],
    historyKey: 'calculasTypingHistory',
    soundKey: 'ct-sound',
    volumeKey: 'ct-vol'
  };

  var state = {
    duration: CONFIG.defaultDuration,
    mode: 'standard',
    words: [],
    engine: null,
    timerId: null,
    finished: false,
    started: false,
    initialized: false
  };

  var DOM = {};

  /* ------------------------------------------------------------------ */
  /* DOM helpers                                                         */
  /* ------------------------------------------------------------------ */

  function byId(id) {
    return document.getElementById(id);
  }

  function query(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function queryAll(selector, parent) {
    return (parent || document).querySelectorAll(selector);
  }

  function cacheRoot() {
    DOM.testSection = byId('typing-test');
  }

  function cacheElements() {
    DOM.modeButtons = queryAll('#typing-test .mode');
    DOM.durationButtons = queryAll('#typing-test .duration-btn');

    DOM.soundToggle = byId('sound-toggle');
    DOM.soundVolume = byId('sound-vol');

    DOM.time = byId('time');
    DOM.wpm = byId('wpm');
    DOM.accuracy = byId('accuracy');
    DOM.errors = byId('errors');
    DOM.progress = byId('progress-bar');

    DOM.typingArea = byId('typing-area');
    DOM.passage = byId('passage');
    DOM.input = byId('typing-input');

    DOM.result = query('#typing-test .tt-result');
    DOM.resultWpm = byId('result-wpm');
    DOM.resultAccuracy = byId('result-accuracy');
    DOM.resultErrors = byId('result-errors');
    DOM.resultMode = byId('result-mode');
    DOM.resultDuration = byId('result-duration');
    DOM.tryAgain = byId('try-again');

    DOM.bestWpm = byId('best-wpm');
    DOM.testCount = byId('test-count');
    DOM.history = byId('history');
  }

  /* ------------------------------------------------------------------ */
  /* Test interface                                                      */
  /* ------------------------------------------------------------------ */

  function buildTestUI() {
    if (!DOM.testSection) return;

    DOM.testSection.innerHTML = [
      '<div class="wrap tt-wrap">',
        '<div class="tt">',

          '<div class="tt-bar">',

            '<div class="chips" role="group" aria-label="Typing mode">',
              '<button type="button" class="chip mode" data-mode="standard" aria-pressed="true">Standard</button>',
              '<button type="button" class="chip mode" data-mode="numbers" aria-pressed="false">Numbers</button>',
              '<button type="button" class="chip mode" data-mode="punctuation" aria-pressed="false">Punctuation</button>',
            '</div>',

            '<div class="chips" role="group" aria-label="Test duration">',
              '<button type="button" class="chip duration-btn" data-duration="15" aria-pressed="false">15s</button>',
              '<button type="button" class="chip duration-btn" data-duration="30" aria-pressed="true">30s</button>',
              '<button type="button" class="chip duration-btn" data-duration="60" aria-pressed="false">60s</button>',
            '</div>',

            '<div class="tog">',
              '<button type="button" class="chip" id="sound-toggle" aria-pressed="false" aria-label="Typewriter Sound off">🔇 Typewriter Sound</button>',
            '</div>',

            '<label class="cd" for="sound-vol">',
              '<span class="st-l">Volume</span>',
              '<input id="sound-vol" type="range" min="0" max="100" step="1" value="55" aria-label="Typewriter Sound volume">',
            '</label>',

          '</div>',

          '<div class="tt-stats" aria-live="polite">',
            '<div class="st"><span class="st-v" id="time">00:30</span><span class="st-l">TIME</span></div>',
            '<div class="st"><span class="st-v" id="wpm">0</span><span class="st-l">WPM</span></div>',
            '<div class="st"><span class="st-v" id="accuracy">100%</span><span class="st-l">ACCURACY</span></div>',
            '<div class="st"><span class="st-v" id="errors">0</span><span class="st-l">ERRORS</span></div>',
          '</div>',

          '<div class="tt-progress" aria-hidden="true"><i id="progress-bar"></i></div>',

          '<div class="tt-area" id="typing-area">',
            '<div class="tt-text" id="passage" aria-hidden="true"></div>',
            '<textarea class="tt-input" id="typing-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the displayed passage"></textarea>',
          '</div>',

          '<p class="tt-hint">Click the passage and start typing. The timer begins with your first key.</p>',
          '<p class="touch-note">Use a physical keyboard for the best experience.</p>',

          '<div class="tt-result" hidden aria-live="polite">',
            '<div class="res-main">',
              '<div><strong id="result-wpm">0</strong><span>WPM</span></div>',
              '<div><strong id="result-accuracy">100%</strong><span>Accuracy</span></div>',
            '</div>',

            '<dl class="res-grid">',
              '<div><dt>Errors</dt><dd id="result-errors">0</dd></div>',
              '<div><dt>Mode</dt><dd id="result-mode">Standard</dd></div>',
              '<div><dt>Duration</dt><dd id="result-duration">30.0s</dd></div>',
            '</dl>',

            '<p class="res-note" id="result-note">Keep a steady rhythm and focus on accuracy.</p>',

            '<div class="res-actions">',
              '<button type="button" class="btn primary" id="try-again">Try again</button>',
              '<a href="index.html" class="btn">Home</a>',
            '</div>',
          '</div>',

        '</div>',

        '<section class="section" aria-labelledby="progress-heading">',
          '<div class="section-heading">',
            '<div class="eyebrow">PROGRESS</div>',
            '<h2 id="progress-heading">Your recent typing</h2>',
          '</div>',

          '<div class="grid">',
            '<div class="metric-panel"><span class="st-l">Best WPM</span><div class="st-v" id="best-wpm">0</div></div>',
            '<div class="metric-panel"><span class="st-l">Tests completed</span><div class="st-v" id="test-count">0</div></div>',
          '</div>',

          '<div class="metric-panel">',
            '<span class="st-l">History</span>',
            '<div id="history"><p>No completed tests yet.</p></div>',
          '</div>',
        '</section>',

      '</div>'
    ].join('');
  }

  /* ------------------------------------------------------------------ */
  /* Content                                                             */
  /* ------------------------------------------------------------------ */

  function randomNumber(max) {
    return Math.floor(Math.random() * max);
  }

  function shuffle(list) {
    var copy = Array.isArray(list) ? list.slice() : [];
    var i;
    var j;
    var temp;

    for (i = copy.length - 1; i > 0; i--) {
      j = randomNumber(i + 1);
      temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }

    return copy;
  }

  function cleanWordArray(value) {
    if (Array.isArray(value)) {
      return value
        .map(function (item) {
          return String(item).trim();
        })
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    }

    return [];
  }

  function standardWords() {
    if (
      typeof CalculasContent === 'undefined' ||
      !Array.isArray(CalculasContent.paragraphs)
    ) {
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
        'confidence'
      ];
    }

    var paragraphs =
      shuffle(CalculasContent.paragraphs);

    var result = [];
    var cursor = 0;

    while (result.length < 180) {
      if (cursor >= paragraphs.length) {
        paragraphs =
          shuffle(
            CalculasContent.paragraphs
          );

        cursor = 0;
      }

      var paragraph =
        paragraphs[cursor++];

      var cleaned =
        paragraph;

      if (
        CalculasContent.gen &&
        typeof CalculasContent.gen.clean ===
          'function'
      ) {
        cleaned =
          CalculasContent.gen.clean(
            paragraph
          );
      }

      result =
        result.concat(
          cleanWordArray(
            cleaned
          )
        );
    }

    return result.slice(
      0,
      180
    );
  }

  function numberWords() {
    if (
      typeof CalculasContent !==
        'undefined' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.numbers ===
        'function'
    ) {
      return cleanWordArray(
        CalculasContent.gen.numbers(
          180
        )
      );
    }

    var result = [];
    var i;

    for (
      i = 0;
      i < 180;
      i++
    ) {
      var length =
        1 + randomNumber(5);

      var value =
        String(
          1 + randomNumber(9)
        );

      while (
        value.length <
        length
      ) {
        value += String(
          randomNumber(10)
        );
      }

      result.push(
        value
      );
    }

    return result;
  }

  function punctuationWords() {
    if (
      typeof CalculasContent !==
        'undefined' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.punctuate ===
        'function' &&
      Array.isArray(
        CalculasContent.common
      )
    ) {
      var pool = [];

      if (
        typeof CalculasContent.gen.pick ===
          'function'
      ) {
        pool =
          CalculasContent.gen.pick(
            CalculasContent.common,
            180
          );
      } else {
        pool =
          shuffle(
            CalculasContent.common
          ).slice(
            0,
            180
          );
      }

      return cleanWordArray(
        CalculasContent.gen.punctuate(
          pool
        )
      );
    }

    return [
      'Typing,',
      'practice',
      'builds',
      'speed.',
      'Accuracy',
      'matters',
      'too!',
      'Stay',
      'calm',
      'and',
      'keep',
      'going.'
    ];
  }

  function buildWords() {
    if (
      state.mode ===
      'numbers'
    ) {
      return numberWords();
    }

    if (
      state.mode ===
      'punctuation'
    ) {
      return punctuationWords();
    }

    return standardWords();
  }

  /* ------------------------------------------------------------------ */
  /* Engine                                                              */
  /* ------------------------------------------------------------------ */

  function createEngine() {
    if (
      typeof CalculasEngine ===
      'undefined'
    ) {
      console.error(
        '[Calculas Typing] engine.js did not load.'
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
        state.words,
        {
          duration:
            state.duration
        }
      );
    } catch (error) {
      console.error(
        '[Calculas Typing] Failed to create engine:',
        error
      );

      return null;
    }
  }

  function engineBuffer() {
    if (
      state.engine &&
      typeof state.engine.buffer ===
        'function'
    ) {
      return state.engine.buffer();
    }

    return '';
  }

  function engineIndex() {
    if (
      state.engine &&
      typeof state.engine.index ===
        'function'
    ) {
      return state.engine.index();
    }

    return 0;
  }

  /* ------------------------------------------------------------------ */
  /* Passage rendering                                                   */
  /* ------------------------------------------------------------------ */

  function renderPassage() {
    if (!DOM.passage) return;

    DOM.passage.innerHTML =
      '';

    state.words.forEach(
      function (
        word,
        wordIndex
      ) {
        var wordNode =
          document.createElement(
            'span'
          );

        wordNode.className =
          'w';

        wordNode.dataset.word =
          String(
            wordIndex
          );

        String(word)
          .split('')
          .forEach(
            function (
              character
            ) {
              var charNode =
                document.createElement(
                  'span'
                );

              charNode.className =
                'c';

              charNode.textContent =
                character;

              wordNode.appendChild(
                charNode
              );
            }
          );

        DOM.passage.appendChild(
          wordNode
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

    var currentIndex =
      engineIndex();

    var buffer =
      engineBuffer();

    var words =
      state.words;

    var wordNodes =
      DOM.passage.querySelectorAll(
        '.w'
      );

    wordNodes.forEach(
      function (
        wordNode,
        wordIndex
      ) {
        var chars =
          wordNode.querySelectorAll(
            '.c'
          );

        chars.forEach(
          function (
            charNode,
            charIndex
          ) {
            charNode.className =
              'c';

            if (
              wordIndex <
              currentIndex
            ) {
              charNode.classList.add(
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
              String(
                words[
                  wordIndex
                ] || ''
              );

            if (
              charIndex <
              buffer.length
            ) {
              charNode.classList.add(
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
              charNode.classList.add(
                'cur'
              );
            }
          }
        );
      }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Statistics                                                          */
  /* ------------------------------------------------------------------ */

  function formatTime(seconds) {
    var value =
      Math.max(
        0,
        Math.floor(
          seconds
        )
      );

    var minutes =
      Math.floor(
        value / 60
      );

    var remaining =
      value % 60;

    return (
      String(
        minutes
      ).padStart(
        2,
        '0'
      ) +
      ':' +
      String(
        remaining
      ).padStart(
        2,
        '0'
      )
    );
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
          ) /
          1000
        )
      );

    var accuracy =
      Number(
        snapshot.accuracy
      );

    if (
      !Number.isFinite(
        accuracy
      )
    ) {
      accuracy =
        100;
    }

    var wpm =
      Number(
        snapshot.wpm
      );

    if (
      !Number.isFinite(
        wpm
      )
    ) {
      wpm =
        0;
    }

    var errors =
      Number(
        snapshot.errors
      );

    if (
      !Number.isFinite(
        errors
      )
    ) {
      errors =
        0;
    }

    if (DOM.time) {
      DOM.time.textContent =
        formatTime(
          remaining
        );
    }

    if (DOM.wpm) {
      DOM.wpm.textContent =
        String(
          Math.max(
            0,
            Math.round(
              wpm
            )
          )
        );
    }

    if (
      DOM.accuracy
    ) {
      DOM.accuracy.textContent =
        Math.max(
          0,
          Math.min(
            100,
            Math.round(
              accuracy
            )
          )
        ) +
        '%';
    }

    if (DOM.errors) {
      DOM.errors.textContent =
        String(
          Math.max(
            0,
            Math.round(
              errors
            )
          )
        );
    }

    if (
      DOM.progress
    ) {
      var completed =
        Number(
          snapshot.words
        ) || 0;

      var total =
        Math.max(
          1,
          state.words.length
        );

      var percentage =
        (
          completed /
          total
        ) *
        100;

      DOM.progress.style.width =
        Math.max(
          0,
          Math.min(
            100,
            percentage
          )
        ) +
        '%';
    }

    renderHighlight();
  }

  /* ------------------------------------------------------------------ */
  /* Timer                                                               */
  /* ------------------------------------------------------------------ */

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

  function startTimerIfNeeded() {
    if (
      state.started ||
      state.finished ||
      !state.engine
    ) {
      return;
    }

    if (
      typeof state.engine.started !==
        'function' ||
      !state.engine.started()
    ) {
      return;
    }

    state.started =
      true;

    stopTimer();

    state.timerId =
      window.setInterval(
        function () {
          var now =
            performance.now();

          updateStats(
            now
          );

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

  /* ------------------------------------------------------------------ */
  /* Sound                                                               */
  /* ------------------------------------------------------------------ */

  function playSound(type) {
    if (
      typeof CalculasSound ===
        'undefined' ||
      typeof CalculasSound.isEnabled !==
        'function' ||
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
      return;
    }

    if (
      type === 'space' &&
      typeof CalculasSound.space ===
        'function'
    ) {
      CalculasSound.space();
      return;
    }

    if (
      type === 'back' &&
      typeof CalculasSound.back ===
        'function'
    ) {
      CalculasSound.back();
    }
  }

  function updateSoundButton() {
    if (
      !DOM.soundToggle
    ) {
      return;
    }

    var enabled =
      typeof CalculasSound !==
        'undefined' &&
      typeof CalculasSound.isEnabled ===
        'function' &&
      CalculasSound.isEnabled();

    DOM.soundToggle.textContent =
      enabled
        ? '🔊 Typewriter Sound'
        : '🔇 Typewriter Sound';

    DOM.soundToggle.setAttribute(
      'aria-pressed',
      String(
        enabled
      )
    );

    DOM.soundToggle.setAttribute(
      'aria-label',
      enabled
        ? 'Typewriter Sound on, click to mute'
        : 'Typewriter Sound off, click to enable'
    );
  }

  function setupSound() {
    if (
      typeof CalculasSound ===
      'undefined'
    ) {
      console.warn(
        '[Calculas Typing] sound.js did not load.'
      );

      return;
    }

    updateSoundButton();

    if (
      DOM.soundToggle
    ) {
      DOM.soundToggle.addEventListener(
        'click',
        function () {
          var enabled =
            CalculasSound.isEnabled();

          CalculasSound.setEnabled(
            !enabled
          );

          updateSoundButton();
        }
      );
    }

    if (
      DOM.soundVolume
    ) {
      DOM.soundVolume.value =
        String(
          CalculasSound.getVolume()
        );

      DOM.soundVolume.addEventListener(
        'input',
        function () {
          CalculasSound.setVolume(
            Number(
              this.value
            )
          );
        }
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /* Input handling                                                       */
  /* ------------------------------------------------------------------ */

  function syncInput() {
    if (
      !DOM.input
    ) {
      return;
    }

    DOM.input.value =
      engineBuffer();
  }

  function focusInput() {
    if (
      !DOM.input
    ) {
      return;
    }

    window.setTimeout(
      function () {
        try {
          DOM.input.focus({
            preventScroll:
              true
          });
        } catch (
          error
        ) {
          DOM.input.focus();
        }
      },
      20
    );
  }

  function handleTypingKey(
    event
  ) {
    if (
      state.finished ||
      !state.engine
    ) {
      return;
    }

    var now =
      performance.now();

    if (
      event.key ===
      'Escape'
    ) {
      event.preventDefault();

      resetTest(
        true
      );

      return;
    }

    if (
      event.key ===
      'Backspace'
    ) {
      event.preventDefault();

      if (
        typeof state.engine.backspace ===
          'function' &&
        state.engine.backspace()
      ) {
        playSound(
          'back'
        );

        syncInput();
        renderHighlight();
        updateStats(
          now
        );
      }

      return;
    }

    if (
      event.key ===
      ' '
    ) {
      event.preventDefault();

      if (
        typeof state.engine.space ===
          'function' &&
        state.engine.space(
          now
        )
      ) {
        playSound(
          'space'
        );

        syncInput();

        startTimerIfNeeded();

        updateStats(
          now
        );

        checkCompletion();
      }

      return;
    }

    if (
      event.key.length !==
        1 ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey
    ) {
      return;
    }

    event.preventDefault();

    if (
      typeof state.engine.type !==
      'function'
    ) {
      console.error(
        '[Calculas Typing] engine.type() is missing.'
      );

      return;
    }

    var accepted =
      state.engine.type(
        event.key,
        now
      );

    if (
      !accepted
    ) {
      return;
    }

    playSound(
      'key'
    );

    syncInput();

    startTimerIfNeeded();

    updateStats(
      now
    );

    checkCompletion();
  }

  function setupInput() {
    if (
      !DOM.input
    ) {
      console.error(
        '[Calculas Typing] #typing-input is missing.'
      );

      return;
    }

    DOM.input.addEventListener(
      'keydown',
      handleTypingKey
    );

    DOM.input.addEventListener(
      'paste',
      function (
        event
      ) {
        event.preventDefault();
      }
    );

    DOM.input.addEventListener(
      'drop',
      function (
        event
      ) {
        event.preventDefault();
      }
    );

    DOM.input.addEventListener(
      'input',
      function () {
        syncInput();
      }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Modes and duration                                                  */
  /* ------------------------------------------------------------------ */

  function setupModes() {
    DOM.modeButtons.forEach(
      function (
        button
      ) {
        button.addEventListener(
          'click',
          function () {
            state.mode =
              this.getAttribute(
                'data-mode'
              ) ||
              'standard';

            DOM.modeButtons.forEach(
              function (
                item
              ) {
                var active =
                  item ===
                  button;

                item.classList.toggle(
                  'active',
                  active
                );

                item.setAttribute(
                  'aria-pressed',
                  String(
                    active
                  )
                );
              }
            );

            resetTest(
              true
            );
          }
        );
      }
    );
  }

  function setupDurations() {
    DOM.durationButtons.forEach(
      function (
        button
      ) {
        button.addEventListener(
          'click',
          function () {
            var selected =
              Number(
                this.getAttribute(
                  'data-duration'
                )
              );

            if (
              CONFIG.durations.indexOf(
                selected
              ) === -1
            ) {
              return;
            }

            state.duration =
              selected;

            DOM.durationButtons.forEach(
              function (
                item
              ) {
                var active =
                  item ===
                  button;

                item.setAttribute(
                  'aria-pressed',
                  String(
                    active
                  )
                );

                item.classList.toggle(
                  'active',
                  active
                );
              }
            );

            resetTest(
              true
            );
          }
        );
      }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Results and history                                                 */
  /* ------------------------------------------------------------------ */

  function readHistory() {
    try {
      var raw =
        localStorage.getItem(
          CONFIG.historyKey
        );

      if (
        !raw
      ) {
        return [];
      }

      var data =
        JSON.parse(
          raw
        );

      return Array.isArray(
        data
      )
        ? data
        : [];
    } catch (
      error
    ) {
      return [];
    }
  }

  function writeHistory(
    history
  ) {
    try {
      localStorage.setItem(
        CONFIG.historyKey,
        JSON.stringify(
          history
        )
      );
    } catch (
      error
    ) {
      /* localStorage is optional. */
    }
  }

  function renderHistory(
    history
  ) {
    if (
      !DOM.history
    ) {
      return;
    }

    var items =
      history ||
      readHistory();

    if (
      DOM.testCount
    ) {
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

    if (
      DOM.bestWpm
    ) {
      DOM.bestWpm.textContent =
        String(
          Math.round(
            best
          )
        );
    }

    DOM.history.innerHTML =
      '';

    if (
      !items.length
    ) {
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

          var mode =
            String(
              item.mode ||
                'standard'
            );

          row.textContent =
            String(
              item.wpm ||
                0
            ) +
            ' WPM · ' +
            String(
              item.accuracy ||
                '100%'
            ) +
            ' · ' +
            String(
              item.errors ||
                0
            ) +
            ' errors · ' +
            String(
              item.duration ||
                0
            ) +
            's · ' +
            mode +
            ' · ' +
            String(
              item.time ||
                ''
            );

          DOM.history.appendChild(
            row
          );
        }
      );
  }

  function saveResult(
    snapshot
  ) {
    var history =
      readHistory();

    history.unshift({
      wpm:
        Math.max(
          0,
          Math.round(
            Number(
              snapshot.wpm
            ) || 0
          )
        ),

      accuracy:
        Math.max(
          0,
          Math.min(
            100,
            Math.round(
              Number(
                snapshot.accuracy
              ) || 100
            )
          )
        ) +
        '%',

      errors:
        Math.max(
          0,
          Math.round(
            Number(
              snapshot.errors
            ) || 0
          )
        ),

      duration:
        state.duration,

      mode:
        state.mode,

      time:
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

    writeHistory(
      history.slice(
        0,
        20
      )
    );

    renderHistory(
      history
    );
  }

  /* ------------------------------------------------------------------ */
  /* Completion                                                          */
  /* ------------------------------------------------------------------ */

  function checkCompletion() {
    if (
      !state.engine ||
      state.finished
    ) {
      return;
    }

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

    state.finished =
      true;

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
      Number(
        snapshot.accuracy
      );

    if (
      !Number.isFinite(
        accuracy
      )
    ) {
      accuracy =
        100;
    }

    accuracy =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            accuracy
          )
        )
      );

    var errors =
      Math.max(
        0,
        Math.round(
          Number(
            snapshot.errors
          ) || 0
        )
      );

    var elapsed =
      Math.max(
        0,
        Number(
          snapshot.elapsed
        ) || 0
      );

    if (
      DOM.resultWpm
    ) {
      DOM.resultWpm.textContent =
        String(
          wpm
        );
    }

    if (
      DOM.resultAccuracy
    ) {
      DOM.resultAccuracy.textContent =
        accuracy +
        '%';
    }

    if (
      DOM.resultErrors
    ) {
      DOM.resultErrors.textContent =
        String(
          errors
        );
    }

    if (
      DOM.resultMode
    ) {
      DOM.resultMode.textContent =
        state.mode
          .charAt(
            0
          )
          .toUpperCase() +
        state.mode.slice(
          1
        );
    }

    if (
      DOM.resultDuration
    ) {
      DOM.resultDuration.textContent =
        (
          elapsed /
          1000
        ).toFixed(
          1
        ) +
        's / ' +
        state.duration +
        's';
    }

    var note =
      byId(
        'result-note'
      );

    if (
      note
    ) {
      note.textContent =
        accuracy >=
        95
          ? 'Excellent accuracy. Keep the rhythm steady.'
          : 'Focus on clean, accurate keystrokes before chasing speed.';
    }

    if (
      DOM.result
    ) {
      DOM.result.hidden =
        false;
    }

    saveResult({
      wpm:
        wpm,

      accuracy:
        accuracy,

      errors:
        errors,

      elapsed:
        elapsed
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reset                                                               */
  /* ------------------------------------------------------------------ */

  function resetTest(
    shouldFocus
  ) {
    stopTimer();

    state.finished =
      false;

    state.started =
      false;

    state.words =
      buildWords();

    state.engine =
      createEngine();

    resetStats();

    renderPassage();

    if (
      DOM.result
    ) {
      DOM.result.hidden =
        true;
    }

    if (
      DOM.input
    ) {
      DOM.input.value =
        '';
    }

    if (
      shouldFocus
    ) {
      focusInput();
    }
  }

  function resetStats() {
    if (
      DOM.time
    ) {
      DOM.time.textContent =
        formatTime(
          state.duration
        );
    }

    if (
      DOM.wpm
    ) {
      DOM.wpm.textContent =
        '0';
    }

    if (
      DOM.accuracy
    ) {
      DOM.accuracy.textContent =
        '100%';
    }

    if (
      DOM.errors
    ) {
      DOM.errors.textContent =
        '0';
    }

    if (
      DOM.progress
    ) {
      DOM.progress.style.width =
        '0%';
    }
  }

  /* ------------------------------------------------------------------ */
  /* Initialization                                                      */
  /* ------------------------------------------------------------------ */

  function init() {
    if (
      state.initialized
    ) {
      return;
    }

    cacheRoot();

    if (
      !DOM.testSection
    ) {
      /*
       * app.js can safely exist on index.html.
       * It only activates on typing-test.html.
       */
      return;
    }

    buildTestUI();

    cacheElements();

    setupModes();
    setupDurations();
    setupSound();
    setupInput();

    if (
      DOM.tryAgain
    ) {
      DOM.tryAgain.addEventListener(
        'click',
        function () {
          resetTest(
            true
          );
        }
      );
    }

    if (
      DOM.typingArea
    ) {
      DOM.typingArea.addEventListener(
        'click',
        function () {
          focusInput();
        }
      );
    }

    renderHistory();

    resetTest(
      false
    );

    state.initialized =
      true;

    console.log(
      '[Calculas Typing] Dedicated typing test initialized successfully.'
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