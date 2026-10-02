/*! Calculas Typing app - dedicated typing test controller. */
(function () {
  'use strict';

  var state = {
    duration: 30,
    durations: [15, 30, 60],
    mode: 'standard',
    engine: null,
    timerId: null,
    started: false,
    finished: false,
    words: []
  };

  var DOM = {};

  function cacheRoot() {
    DOM.testSection =
      document.getElementById('typing-test');
  }

  function buildUI() {
    if (!DOM.testSection) return;

    DOM.testSection.innerHTML = [
      '<div class="wrap tt-wrap">',
        '<div class="tt">',

          '<div class="tt-bar">',

            '<div class="chips" role="group" aria-label="Typing mode">',
              '<button type="button" class="chip mode active" data-mode="standard" aria-pressed="true">Standard</button>',
              '<button type="button" class="chip mode" data-mode="numbers" aria-pressed="false">Numbers</button>',
              '<button type="button" class="chip mode" data-mode="punctuation" aria-pressed="false">Punctuation</button>',
            '</div>',

            '<div class="chips" role="group" aria-label="Test duration">',
              '<span class="st-l">TIME</span>',
              '<button type="button" class="chip duration active" data-duration="15" aria-pressed="false">15s</button>',
              '<button type="button" class="chip duration active-selected" data-duration="30" aria-pressed="true">30s</button>',
              '<button type="button" class="chip duration" data-duration="60" aria-pressed="false">60s</button>',
            '</div>',

            '<div class="tog">',
              '<button type="button" class="chip" id="sound-toggle" aria-pressed="false">🔇 Typewriter Sound</button>',
            '</div>',

            '<label class="cd" for="sound-vol">',
              '<span class="st-l">Volume</span>',
              '<input id="sound-vol" type="range" min="0" max="100" value="55" step="1" aria-label="Typewriter Sound volume">',
            '</label>',

          '</div>',

          '<div class="tt-stats" aria-live="polite">',

            '<div class="st">',
              '<span class="st-v" id="time">00:30</span>',
              '<span class="st-l">TIME</span>',
            '</div>',

            '<div class="st">',
              '<span class="st-v" id="wpm">0</span>',
              '<span class="st-l">WPM</span>',
            '</div>',

            '<div class="st">',
              '<span class="st-v" id="accuracy">100%</span>',
              '<span class="st-l">ACCURACY</span>',
            '</div>',

            '<div class="st">',
              '<span class="st-v" id="errors">0</span>',
              '<span class="st-l">ERRORS</span>',
            '</div>',

          '</div>',

          '<div class="tt-progress" aria-hidden="true">',
            '<i id="progress-bar"></i>',
          '</div>',

          '<div class="tt-area" id="typing-area">',

            '<div id="passage" class="tt-text" aria-hidden="true"></div>',

            '<textarea',
              ' id="typing-input"',
              ' class="tt-input"',
              ' autocomplete="off"',
              ' autocapitalize="off"',
              ' autocorrect="off"',
              ' spellcheck="false"',
              ' aria-label="Type the displayed passage"',
            '></textarea>',

          '</div>',

          '<p class="tt-hint">',
            'Click the passage and start typing. The timer begins with your first key.',
          '</p>',

          '<p class="touch-note">',
            'Use a physical keyboard for the best experience.',
          '</p>',

          '<div class="tt-result" hidden aria-live="polite">',

            '<div class="res-main">',
              '<div>',
                '<strong id="result-wpm">0</strong>',
                '<span>WPM</span>',
              '</div>',
              '<div>',
                '<strong id="result-accuracy">100%</strong>',
                '<span>Accuracy</span>',
              '</div>',
            '</div>',

            '<dl class="res-grid">',
              '<div>',
                '<dt>Errors</dt>',
                '<dd id="result-errors">0</dd>',
              '</div>',
              '<div>',
                '<dt>Mode</dt>',
                '<dd id="result-mode">Standard</dd>',
              '</div>',
              '<div>',
                '<dt>Duration</dt>',
                '<dd id="result-duration">30.0s</dd>',
              '</div>',
            '</dl>',

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
            '<div class="metric-panel">',
              '<span class="st-l">Best WPM</span>',
              '<div class="st-v" id="best-wpm">0</div>',
            '</div>',
            '<div class="metric-panel">',
              '<span class="st-l">Tests completed</span>',
              '<div class="st-v" id="test-count">0</div>',
            '</div>',
          '</div>',

          '<div class="metric-panel">',
            '<span class="st-l">History</span>',
            '<div id="history"><p>No completed tests yet.</p></div>',
          '</div>',

        '</section>',

      '</div>'
    ].join('');
  }

  function cacheElements() {
    DOM.modeButtons =
      document.querySelectorAll(
        '#typing-test .mode'
      );

    DOM.durationButtons =
      document.querySelectorAll(
        '#typing-test .duration'
      );

    DOM.soundToggle =
      document.getElementById(
        'sound-toggle'
      );

    DOM.volume =
      document.getElementById(
        'sound-vol'
      );

    DOM.passage =
      document.getElementById(
        'passage'
      );

    DOM.input =
      document.getElementById(
        'typing-input'
      );

    DOM.area =
      document.getElementById(
        'typing-area'
      );

    DOM.time =
      document.getElementById(
        'time'
      );

    DOM.wpm =
      document.getElementById(
        'wpm'
      );

    DOM.accuracy =
      document.getElementById(
        'accuracy'
      );

    DOM.errors =
      document.getElementById(
        'errors'
      );

    DOM.progress =
      document.getElementById(
        'progress-bar'
      );

    DOM.result =
      document.querySelector(
        '#typing-test .tt-result'
      );

    DOM.resultWpm =
      document.getElementById(
        'result-wpm'
      );

    DOM.resultAccuracy =
      document.getElementById(
        'result-accuracy'
      );

    DOM.resultErrors =
      document.getElementById(
        'result-errors'
      );

    DOM.resultMode =
      document.getElementById(
        'result-mode'
      );

    DOM.resultDuration =
      document.getElementById(
        'result-duration'
      );

    DOM.tryAgain =
      document.getElementById(
        'try-again'
      );

    DOM.bestWpm =
      document.getElementById(
        'best-wpm'
      );

    DOM.testCount =
      document.getElementById(
        'test-count'
      );

    DOM.history =
      document.getElementById(
        'history'
      );
  }

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
      /*
       * THIS IS THE CORRECT ENGINE API.
       */
      return CalculasEngine.create(
        state.words,
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

  function shuffle(list) {
    var copy =
      Array.isArray(list)
        ? list.slice()
        : [];

    for (
      var i =
        copy.length - 1;
      i > 0;
      i--
    ) {
      var j =
        Math.floor(
          Math.random() *
          (i + 1)
        );

      var temp =
        copy[i];

      copy[i] =
        copy[j];

      copy[j] =
        temp;
    }

    return copy;
  }

  function buildStandardWords() {
    if (
      typeof CalculasContent ===
      'undefined'
    ) {
      return [
        'Typing',
        'practice',
        'helps',
        'you',
        'build',
        'speed',
        'accuracy',
        'and',
        'focus'
      ];
    }

    var output = [];

    var paragraphs =
      Array.isArray(
        CalculasContent.paragraphs
      )
        ? shuffle(
            CalculasContent.paragraphs
          )
        : [];

    while (
      output.length < 180 &&
      paragraphs.length
    ) {
      for (
        var i = 0;
        i < paragraphs.length &&
        output.length < 180;
        i++
      ) {
        var paragraph =
          paragraphs[i];

        if (
          CalculasContent.gen &&
          typeof CalculasContent.gen.clean ===
            'function'
        ) {
          paragraph =
            CalculasContent.gen.clean(
              paragraph
            );
        }

        if (
          typeof paragraph ===
          'string'
        ) {
          output =
            output.concat(
              paragraph.split(
                /\s+/
              )
            );
        }
      }

      paragraphs =
        shuffle(
          CalculasContent.paragraphs
        );
    }

    return output
      .filter(Boolean)
      .slice(
        0,
        180
      );
  }

  function buildWords() {
    if (
      typeof CalculasContent ===
      'undefined'
    ) {
      return buildStandardWords();
    }

    if (
      state.mode ===
        'numbers' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.numbers ===
        'function'
    ) {
      return CalculasContent.gen.numbers(
        180
      );
    }

    if (
      state.mode ===
        'punctuation' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.punctuate ===
        'function'
    ) {
      var common =
        Array.isArray(
          CalculasContent.common
        )
          ? CalculasContent.common
          : [];

      var selected =
        CalculasContent.gen.pick(
          common,
          180
        );

      return CalculasContent.gen.punctuate(
        selected
      );
    }

    return buildStandardWords();
  }

  function resetTest(
    focus
  ) {
    stopTimer();

    state.started =
      false;

    state.finished =
      false;

    state.words =
      buildWords();

    state.engine =
      createEngine();

    if (DOM.input) {
      DOM.input.value =
        '';
    }

    if (DOM.result) {
      DOM.result.hidden =
        true;
    }

    resetStats();

    renderPassage();

    if (focus) {
      focusInput(50);
    }
  }

  function resetStats() {
    DOM.time.textContent =
      '00:' +
      String(
        state.duration
      ).padStart(
        2,
        '0'
      );

    DOM.wpm.textContent =
      '0';

    DOM.accuracy.textContent =
      '100%';

    DOM.errors.textContent =
      '0';

    DOM.progress.style.width =
      '0%';
  }

  function renderPassage() {
    DOM.passage.innerHTML =
      '';

    state.words.forEach(
      function (
        word,
        wordIndex
      ) {
        var word =
          String(
            word
          );

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

        for (
          var i = 0;
          i < word.length;
          i++
        ) {
          var charNode =
            document.createElement(
              'span'
            );

          charNode.className =
            'c';

          charNode.textContent =
            word.charAt(i);

          wordNode.appendChild(
            charNode
          );
        }

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
      !state.engine
    ) {
      return;
    }

    var currentWordIndex =
      state.engine.index();

    var buffer =
      state.engine.buffer();

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
              currentWordIndex
            ) {
              charNode.classList.add(
                'ok'
              );

              return;
            }

            if (
              wordIndex !==
              currentWordIndex
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
              if (
                buffer.charAt(
                  charIndex
                ) ===
                target.charAt(
                  charIndex
                )
              ) {
                charNode.classList.add(
                  'ok'
                );
              } else {
                charNode.classList.add(
                  'no'
                );
              }
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

  function focusInput(
    delay
  ) {
    window.setTimeout(
      function () {
        if (DOM.input) {
          DOM.input.focus({
            preventScroll:
              true
          });
        }
      },
      delay || 0
    );
  }

  function syncInput() {
    if (
      !DOM.input ||
      !state.engine
    ) {
      return;
    }

    DOM.input.value =
      state.engine.buffer();
  }

  function startTimer() {
    if (
      state.started ||
      !state.engine
    ) {
      return;
    }

    /*
     * The engine starts timing on the
     * first character or committed space.
     */
    if (
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

  function updateStats(
    now
  ) {
    if (
      !state.engine
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

    DOM.time.textContent =
      '00:' +
      String(
        remaining
      ).padStart(
        2,
        '0'
      );

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

    DOM.errors.textContent =
      String(
        Math.max(
          0,
          Number(
            snapshot.errors
          ) || 0
        )
      );

    var completed =
      Number(
        snapshot.words
      ) || 0;

    var total =
      state.words.length;

    DOM.progress.style.width =
      Math.min(
        100,
        (
          completed /
          Math.max(
            1,
            total
          )
        ) *
        100
      ) +
      '%';

    renderHighlight();
  }

  function handleKeydown(
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
        state.engine.space(
          now
        )
      ) {
        playSound(
          'space'
        );

        syncInput();

        startTimer();

        updateStats(
          now
        );

        renderHighlight();

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

    /*
     * IMPORTANT:
     * The real engine method is .type().
     */
    state.engine.type(
      event.key,
      now
    );

    playSound(
      'key'
    );

    syncInput();

    startTimer();

    updateStats(
      now
    );

    renderHighlight();

    checkCompletion();
  }

  function checkCompletion() {
    if (
      !state.engine ||
      state.finished
    ) {
      return;
    }

    if (
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
        Number(
          snapshot.errors
        ) || 0
      );

    var elapsed =
      Number(
        snapshot.elapsed
      ) || 0;

    DOM.resultWpm.textContent =
      String(
        wpm
      );

    DOM.resultAccuracy.textContent =
      accuracy +
      '%';

    DOM.resultErrors.textContent =
      String(
        errors
      );

    DOM.resultMode.textContent =
      state.mode
        .charAt(0)
        .toUpperCase() +
      state.mode.slice(1);

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

    DOM.result.hidden =
      false;

    saveHistory(
      wpm,
      accuracy,
      errors,
      state.duration
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
          ? JSON.parse(
              raw
            )
          : [];

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch (
      error
    ) {
      return [];
    }
  }

  function saveHistory(
    wpm,
    accuracy,
    errors,
    duration
  ) {
    var history =
      readHistory();

    history.unshift({
      wpm:
        wpm,

      accuracy:
        accuracy + '%',

      errors:
        errors,

      duration:
        duration,

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
    } catch (
      error
    ) {
      /* optional */
    }

    renderHistory(
      history
    );
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

    DOM.testCount.textContent =
      String(
        items.length
      );

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

    DOM.bestWpm.textContent =
      String(
        best
      );

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
              item.duration
            ) +
            's · ' +
            String(
              item.mode
            ) +
            ' · ' +
            String(
              item.time
            );

          DOM.history.appendChild(
            row
          );
        }
      );
  }

  function playSound(
    type
  ) {
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

  function setupSound() {
    if (
      typeof CalculasSound ===
      'undefined'
    ) {
      return;
    }

    var enabled =
      CalculasSound.isEnabled();

    updateSoundButton(
      enabled
    );

    if (DOM.soundToggle) {
      DOM.soundToggle.addEventListener(
        'click',
        function () {
          enabled =
            !enabled;

          CalculasSound.setEnabled(
            enabled
          );

          updateSoundButton(
            enabled
          );
        }
      );
    }

    if (DOM.volume) {
      DOM.volume.value =
        String(
          CalculasSound.getVolume()
        );

      DOM.volume.addEventListener(
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

  function updateSoundButton(
    enabled
  ) {
    if (
      !DOM.soundToggle
    ) {
      return;
    }

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
  }

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
                  item === button;

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
            var value =
              Number(
                this.getAttribute(
                  'data-duration'
                )
              );

            if (
              state.durations.indexOf(
                value
              ) === -1
            ) {
              return;
            }

            state.duration =
              value;

            DOM.durationButtons.forEach(
              function (
                item
              ) {
                var active =
                  item === button;

                item.classList.toggle(
                  'active-selected',
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

  function init() {
    cacheRoot();

    if (
      !DOM.testSection
    ) {
      return;
    }

    buildUI();
    cacheElements();

    setupModes();
    setupDurations();
    setupSound();

    if (DOM.input) {
      DOM.input.addEventListener(
        'keydown',
        handleKeydown
      );

      DOM.input.addEventListener(
        'paste',
        function (
          event
        ) {
          event.preventDefault();
        }
      );
    }

    if (DOM.area) {
      DOM.area.addEventListener(
        'click',
        function () {
          focusInput(
            0
          );
        }
      );
    }

    if (DOM.tryAgain) {
      DOM.tryAgain.addEventListener(
        'click',
        function () {
          resetTest(
            true
          );
        }
      );
    }

    renderHistory();

    resetTest(
      false
    );

    console.log(
      '[Calculas Typing] Typing test initialized successfully.'
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