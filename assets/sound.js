/*! Calculas Typing sound - browser-synthesized mechanical key sounds. */
(function (root) {
  'use strict';

  var ctx = null;
  var master = null;
  var enabled = false;
  var volume = 0.55;

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* storage unavailable */
    }
  }

  var storedEnabled = storageGet('ct-sound');
  enabled = storedEnabled === '1';

  var storedVolume = parseInt(storageGet('ct-vol'), 10);

  if (!isNaN(storedVolume)) {
    volume = Math.max(0, Math.min(100, storedVolume)) / 100;
  }

  function ensureAudio() {
    if (ctx) return ctx;

    var AudioContextClass =
      root.AudioContext || root.webkitAudioContext;

    if (!AudioContextClass) return null;

    try {
      ctx = new AudioContextClass();

      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    } catch (error) {
      ctx = null;
      master = null;
    }

    return ctx;
  }

  function resumeAudio() {
    if (ctx && ctx.state === 'suspended') {
      var promise = ctx.resume();

      if (
        promise &&
        typeof promise.catch === 'function'
      ) {
        promise.catch(function () {});
      }
    }
  }

  function noiseBuffer(audioContext, duration) {
    var samples = Math.max(
      1,
      Math.floor(audioContext.sampleRate * duration)
    );

    var buffer = audioContext.createBuffer(
      1,
      samples,
      audioContext.sampleRate
    );

    var data = buffer.getChannelData(0);

    for (var i = 0; i < samples; i++) {
      var falloff = Math.pow(
        1 - i / samples,
        2
      );

      data[i] =
        (Math.random() * 2 - 1) *
        falloff;
    }

    return buffer;
  }

  function click(freq, q, duration, peak) {
    if (!enabled || volume <= 0) return;

    var audioContext = ensureAudio();

    if (!audioContext || !master) return;

    resumeAudio();

    var time = audioContext.currentTime;

    var source = audioContext.createBufferSource();
    var filter = audioContext.createBiquadFilter();
    var gain = audioContext.createGain();

    source.buffer = noiseBuffer(
      audioContext,
      duration
    );

    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;

    gain.gain.setValueAtTime(
      peak,
      time
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + duration
    );

    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    source.start(time);

    source.stop(
      time + duration + 0.02
    );
  }

  var Sound = {
    key: function () {
      click(
        2500 + Math.random() * 600,
        4.5,
        0.026,
        0.85
      );
    },

    space: function () {
      click(
        950 + Math.random() * 150,
        2,
        0.055,
        1.0
      );
    },

    back: function () {
      click(
        1750,
        5,
        0.018,
        0.55
      );
    },

    isEnabled: function () {
      return enabled;
    },

    setEnabled: function (value) {
      enabled = !!value;

      storageSet(
        'ct-sound',
        enabled ? '1' : '0'
      );

      if (enabled) {
        var audioContext = ensureAudio();

        resumeAudio();

        return !!audioContext;
      }

      return true;
    },

    getVolume: function () {
      return Math.round(
        volume * 100
      );
    },

    setVolume: function (value) {
      var numeric = Number(value);

      if (!isFinite(numeric)) {
        numeric = 0;
      }

      volume =
        Math.max(
          0,
          Math.min(100, numeric)
        ) / 100;

      storageSet(
        'ct-vol',
        String(Math.round(volume * 100))
      );

      if (master) {
        master.gain.value = volume;
      }
    }
  };

  root.CalculasSound = Sound;
})(window);