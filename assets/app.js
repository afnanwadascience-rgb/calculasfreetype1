
/*! Calculas Typing app - dedicated typing-test controller. */
(function () {
  'use strict';

  var state = {
    duration: 30,
    durations: [15, 30, 60],
    mode: 'standard',
    engine: null,
    timerId: null,
    finished: false,
    started: false,
    words: []
  };

  var DOM = {};

  function cacheDom() {
    DOM.testSection =
      document.getElementById('typing-test');
  }

  function buildTestUI() {
    if (!DOM.testSection) return;

    DOM.testSection.innerHTML = [
      '<div class="wrap tt-wrap">',
        '<div class="tt">',

          '<div class="tt-bar">',

            '<div class="chips" role="group" aria-label="Typing mode">',

              '<button',
                ' type="button"',
                ' class="chip mode active"',
                ' data-mode="standard"',
                ' aria-pressed="true"',
              '>',
                'Standard',
              '</button>',

              '<button',
                ' type="button"',
                ' class="chip mode"',
                ' data-mode="numbers"',
                ' aria-pressed="false"',
              '>',
                'Numbers',
              '</button>',

              '<button',
                ' type="button"',
                ' class="chip mode"',
                ' data-mode="punctuation"',
                ' aria-pressed="false"',
              '>',
                'Punctuation',
              '</button>',

            '</div>',

            '<div class="chips duration-controls" role="group" aria-label="Test duration">',

              '<span class="st-l">TIME</span>',

              '<button',
                ' type="button"',
                ' class="chip duration-btn"',
                ' data-duration="15"',
                ' aria-pressed="false"',
              '>',
                '15s',
              '</button>',

              '<button',
                ' type="button"',
                ' class="chip duration-btn active"',
                ' data-duration="30"',
                ' aria-pressed="true"',
              '>',
                '30s',
              '</button>',

              '<button',
                ' type="button"',
                ' class="chip duration-btn"',
                ' data-duration="60"',
                ' aria-pressed="false"',
              '>',
                '60s',
              '</button>',

            '</div>',

            '<div class="tog">',

              '<button',
                ' type="button"',
                ' class="chip"',
                ' id="sound-toggle"',
                ' aria-pressed="false"',
                ' aria-label="Typewriter Sound off"',
              '>',
                '🔇 Typewriter Sound',
              '</button>',

            '</div>',

            '<label class="cd" for="sound-vol">',

              '<span class="st-l">Volume</span>',

              '<input',
                ' id="sound-vol"',
                ' type="range"',
                ' min="0"',
                ' max="100"',
                ' step="1"',
                ' value="55"',
                ' aria-label="Typewriter Sound volume"',
              '>',

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

            '<div',
              ' class="tt-text"',
              ' id="passage"',
              ' aria-hidden="true"',
            '></div>',

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
            'Click the text and start typing. The timer begins with your first key.',
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

              '<button',
                ' type="button"',
                ' class="btn primary"',
                ' data-act="again"',
              '>',
                'Try again',
              '</button>',

              '<a href="index.html" class="btn">',
                'Home',
              '</a>',

            '</div>',

          '</div>',

        '</div>',

        '<section',
          ' class="section"',
          ' aria-labelledby="progress-heading"',
        '>',

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
    DOM.modeButtons =
      document.querySelectorAll(
        '#typing-test .mode'
      );

    DOM.durationButtons =
      document.querySelectorAll(
        '#typing-test .duration-btn'
      );

    DOM.soundToggle =
      document.getElementById(
        'sound-toggle'
      );

    DOM.volumeSlider =
      document.getElementById(
        'sound-vol'
      );

    DOM.passage =
      document.getElementById(
        'passage'
      );

    DOM.typingInput =
      document.getElementById(
        'typing-input'
      );

    DOM.typingArea =
      document.getElementById(
        'typing-area'
      );

    DOM.time =
      document.querySelector(
        '#typing-test [data-s="time"]'
      );

    DOM.wpm =
      document.querySelector(
        '#typing-test [data-s="wpm"]'
      );

    DOM.accuracy =
      document.querySelector(
        '#typing-test [data-s="acc"]'
      );

    DOM.errors =
      document.querySelector(
        '#typing-test [data-s="bad"]'
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
      document.getElementById(
        'history'
      );

    DOM.bestWpm =
      document.getElementById(
        'bestWpm'
      );

    DOM.testCount =
      document.getElementById(
        'testCount'
      );
  }

  function setupModes() {
    DOM.modeButtons.forEach(
      function (button) {
        button.addEventListener(
          'click',
          function () {
            state.mode =
              this.getAttribute(
                'data-mode'
              ) ||
              'standard';

            DOM.modeButtons.forEach(
              function (item) {
                var active =
                  item === button;

                item.classList.toggle(
                  'active',
                  active
                );

                item.setAttribute(
                  'aria-pressed',
                  String(active)
                );
              }
            );

            resetTest(
              state.mode,
              true
            );
          }
        );
      }
    );
  }

  function setupDurations() {
    DOM.durationButtons.forEach(
      function (button) {
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
              state.durations.indexOf(
                selected
              ) === -1
            ) {
              return;
            }

            state.duration =
              selected;

            DOM.durationButtons.forEach(
              function (item) {
                var active =
                  item === button;

                item.classList.toggle(
                  'active',
                  active
                );

                item.setAttribute(
                  'aria-pressed',
                  String(active)
                );
              }
            );

            resetTest(
              state.mode,
              true
            );
          }
        );
      }
    );
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

    updateSoundButton(
      enabled
    );

    if (DOM.soundToggle) {
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
      var initialVolume =
        CalculasSound.getVolume();

      DOM.volumeSlider.value =
        String(
          initialVolume
        );

      DOM.volumeSlider.addEventListener(
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
    if (!DOM.soundToggle) {
      return;
    }

    DOM.soundToggle.textContent =
      enabled
        ? '🔊 Typewriter Sound'
        : '🔇 Typewriter Sound';

    DOM.soundToggle.setAttribute(
      'aria-pressed',
      String(enabled)
    );

    DOM.soundToggle.setAttribute(
      'aria-label',
      enabled
        ? 'Typewriter Sound on, click to mute'
        : 'Typewriter Sound off, click to enable'
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
          focusInput(
            0
          );
        }
      );
    }

    if (DOM.passage) {
      DOM.passage.addEventListener(
        'click',
        function () {
          focusInput(
            0
          );
        }
      );
    }
  }

  function setupTypingInput() {
    if (!DOM.typingInput) {
      return;
    }

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

        if (
          event.key ===
          'Escape'
        ) {
          event.preventDefault();

          resetTest(
            state.mode,
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
            'function'
          ) {
            var changed =
              state.engine.backspace();

            if (changed) {
              playSound(
                'back'
              );

              syncInput();
              renderHighlight();
              updateStats(
                now
              );
            }
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
            'function'
          ) {
            var committed =
              state.engine.space(
                now
              );

            if (committed) {
              playSound(
                'space'
              );

              syncInput();
              startTimerIfNeeded();
              renderHighlight();
              updateStats(
                now
              );
              checkCompletion();
            }
          }

          return;
        }

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
         * The real engine API is .type().
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
            playSound(
              'key'
            );

            syncInput();
            startTimerIfNeeded();
            renderHighlight();
            updateStats(
              now
            );
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
      'drop',
      function (event) {
        event.preventDefault();
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

  function shuffleCopy(
    list
  ) {
    if (
      !Array.isArray(list)
    ) {
      return [];
    }

    if (
      typeof CalculasContent !==
        'undefined' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.shuffle ===
        'function'
    ) {
      return CalculasContent.gen.shuffle(
        list
      );
    }

    var copy =
      list.slice();

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

      var tmp =
        copy[i];

      copy[i] =
        copy[j];

      copy[j] =
        tmp;
    }

    return copy;
  }

  function buildWords(
    selectedMode
  ) {
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
     * NUMBERS MODE
     */
    if (
      selectedMode ===
        'numbers' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.numbers ===
        'function'
    ) {
      return CalculasContent.gen.numbers(
        160
      );
    }

    /*
     * PUNCTUATION MODE
     */
    if (
      selectedMode ===
        'punctuation' &&
      CalculasContent.gen &&
      typeof CalculasContent.gen.punctuate ===
        'function'
    ) {
      var punctuationPool =
        [];

      if (
        Array.isArray(
          CalculasContent.common
        )
      ) {
        punctuationPool =
          shuffleCopy(
            CalculasContent.common
          );
      }

      if (
        punctuationPool.length <
        120
      ) {
        punctuationPool =
          punctuationPool.concat(
            punctuationPool
          );
      }

      return CalculasContent.gen.punctuate(
        punctuationPool.slice(
          0,
          140
        )
      );
    }

    /*
     * STANDARD MODE
     *
     * Build a long, coherent passage
     * from the original site's paragraphs.
     */
    if (
      Array.isArray(
        CalculasContent.paragraphs
      ) &&
      CalculasContent.paragraphs.length
    ) {
      var standardWords =
        [];

      var paragraphOrder =
        shuffleCopy(
          CalculasContent.paragraphs
        );

      while (
        standardWords.length <
        180
      ) {
        for (
          var i = 0;
          i <
            paragraphOrder.length &&
          standardWords.length <
            180;
          i++
        ) {
          var cleanText =
            paragraphOrder[i];

          if (
            CalculasContent.gen &&
            typeof CalculasContent.gen.clean ===
              'function'
          ) {
            cleanText =
              CalculasContent.gen.clean(
                cleanText
              );
          }

          if (
            typeof cleanText ===
            'string'
          ) {
            standardWords =
              standardWords.concat(
                cleanText.split(
                  /\s+/
                )
              );
          }
        }

        paragraphOrder =
          shuffleCopy(
            CalculasContent.paragraphs
          );
      }

      return standardWords
        .filter(Boolean)
        .slice(
          0,
          180
        );
    }

    /*
     * FALLBACK TO COMMON WORDS
     */
    if (
      Array.isArray(
        CalculasContent.common
      )
    ) {
      var fallback =
        [];

      while (
        fallback.length <
        160
      ) {
        fallback =
          fallback.concat(
            shuffleCopy(
              CalculasContent.common
            )
          );
      }

      return fallback.slice(
        0,
        160
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

  function createEngine(
    words
  ) {
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
    shouldFocus
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

    if (
      shouldFocus
    ) {
      focusInput(
        40
      );
    }
  }

  function resetStats() {
    if (DOM.time) {
      DOM.time.textContent =
        '00:' +
        String(
          state.duration
        ).padStart(
          2,
          '0'
        );
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
          i <
          word.length;
          i++
        ) {
          var charNode =
            document.createElement(
              'span'
            );

          charNode.className =
            'c';

          charNode.textContent =
            word.charAt(
              i
            );

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

    var currentBuffer =
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
        var characters =
          wordElement.querySelectorAll(
            '.c'
          );

        characters.forEach(
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
              currentBuffer.length
            ) {
              charElement.classList.add(
                currentBuffer.charAt(
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
              currentBuffer.length
            ) {
              charElement.classList.add(
                'cur'
              );
            }
          }
        );
      }
    );

    /*
     * Keep the active word in view.
     */
    var activeWord =
      DOM.passage.querySelector(
        '.w[data-word="' +
          currentIndex +
          '"]'
      );

    if (
      activeWord &&
      typeof activeWord.scrollIntoView ===
        'function'
    ) {
      var passageRect =
        DOM.passage.getBoundingClientRect();

      var wordRect =
        activeWord.getBoundingClientRect();

      if (
        wordRect.bottom >
          passageRect.bottom - 20 ||
        wordRect.top <
          passageRect.top + 20
      ) {
        activeWord.scrollIntoView({
          block:
            'center'
        });
      }
    }
  }

  function focusInput(
    delay
  ) {
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

    var totalMilliseconds =
      state.duration *
      1000;

    var remaining =
      Math.max(
        0,
        Math.ceil(
          (
            totalMilliseconds -
            elapsed
          ) / 1000
        )
      );

    if (
      DOM.time
    ) {
      DOM.time.textContent =
        '00:' +
        String(
          remaining
        ).padStart(
          2,
          '0'
        );
    }

    if (
      DOM.wpm
    ) {
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

    if (
      DOM.accuracy
    ) {
      var accuracy =
        Number(
          snapshot.accuracy
        );

      if (
        !isFinite(
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
    }

    if (
      DOM.errors
    ) {
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

    if (
      DOM.progress
    ) {
      var completedWords =
        Number(
          snapshot.words
        ) || 0;

      var totalWords =
        typeof state.engine.count ===
        'function'
          ? state.engine.count()
          : state.words.length;

      var percentage =
        (
          completedWords /
          Math.max(
            1,
            totalWords
          )
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

  function checkCompletion() {
    if (
      !state.engine ||
      state.finished
    ) {
      return;
    }

    /*
     * The current engine exposes isFinished().
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
      !isFinite(
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

    if (
      DOM.resultWpm
    ) {
      DOM.resultWpm.textContent =
        String(
          wpm
        );
    }

    if (
      DOM.resultAcc
    ) {
      DOM.resultAcc.textContent =
        accuracy +
        '%';
    }

    if (
      DOM.resultBad
    ) {
      DOM.resultBad.textContent =
        String(
          errors
        );
    }

    if (
      DOM.resultMode
    ) {
      DOM.resultMode.textContent =
        state.mode
          .charAt(0)
          .toUpperCase() +
        state.mode.slice(1);
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

    if (
      DOM.resultNote
    ) {
      DOM.resultNote.textContent =
        accuracy >= 95
          ? 'Excellent accuracy. Keep the rhythm steady.'
          : 'Focus on clean, accurate keystrokes before chasing speed.';
    }

    if (
      DOM.result
    ) {
      DOM.result.hidden =
        false;

      DOM.result.scrollIntoView({
        behavior:
          'smooth',
        block:
          'center'
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
          ? JSON.parse(
              raw
            )
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
      wpm:
        wpm,

      accuracy:
        accuracy + '%',

      errors:
        errors,

      duration:
        (
          elapsed /
          1000
        ).toFixed(
          1
        ),

      mode:
        mode,

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
      /* localStorage optional */
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
          best
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

    /*
     * app.js runs on the dedicated typing-test.html page.
     */
    if (
      !DOM.testSection
    ) {
      return;
    }

    buildTestUI();
    cacheTestDom();

    setupModes();
    setupDurations();
    setupSoundControls();
    setupControls();
    setupTypingInput();

    renderHistory();

    resetTest(
      'standard',
      false
    );

    console.log(
      '[Calculas Typing] Dedicated typing test ready.'
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

