/* buttons.js — DOM button creation, styling, flash effect */

var Buttons = {
  _els: {},

  /** Call once in setup() to create the three DOM buttons */
  init: function() {
    var names = ['clear', 'close', 'stepup'];
    var labels = ['Clear', 'Close', 'Step-Up'];
    for (var i = 0; i < names.length; i++) {
      var btn = createButton(labels[i]);
      btn.addClass('btn');
      btn.position(12 + i * 100, 12);
      btn.attribute('data-name', names[i]);
      Buttons._els[names[i]] = btn;
    }
    Buttons._els.clear.mousePressed(Buttons._onClear);
    Buttons._els.close.mousePressed(Buttons._onClose);
    Buttons._els.stepup.mousePressed(Buttons._onStepUp);
  },

  /** Flash a button blue briefly */
  flash: function(name) {
    var el = Buttons._els[name];
    if (!el) return;
    el.addClass('flash');
    setTimeout(function() { el.removeClass('flash'); }, 300);
  },

  /** Update disabled states each frame */
  update: function() {
    // Close: disabled if < 2 verts, or if dimension > 2
    var closeDisabled = Vertex.count() < 2 || State.closed || State.dimension > 2;
    if (closeDisabled) {
      Buttons._els.close.attribute('disabled', '');
    } else {
      Buttons._els.close.removeAttribute('disabled');
    }

    // Step-Up: disabled if not closed, or if dimension is 2 and not closed
    var stepDisabled = !State.closed;
    if (stepDisabled) {
      Buttons._els.stepup.attribute('disabled', '');
    } else {
      Buttons._els.stepup.removeAttribute('disabled');
    }
  },

  /** Returns true if screen-space coords are over any button */
  isOverAny: function(sx, sy) {
    var keys = ['clear', 'close', 'stepup'];
    for (var i = 0; i < keys.length; i++) {
      var el = Buttons._els[keys[i]].elt;
      var r = el.getBoundingClientRect();
      if (sx >= r.left && sx <= r.right && sy >= r.top && sy <= r.bottom) {
        return true;
      }
    }
    return false;
  },

  /** Hit-test returning button name or null */
  hitTest: function(sx, sy) {
    var keys = ['clear', 'close', 'stepup'];
    for (var i = 0; i < keys.length; i++) {
      var el = Buttons._els[keys[i]].elt;
      var r = el.getBoundingClientRect();
      if (sx >= r.left && sx <= r.right && sy >= r.top && sy <= r.bottom) {
        return keys[i];
      }
    }
    return null;
  },

  // --- handlers ---

  _onClear: function() {
    Buttons.flash('clear');
    Vertex.clear();
    State.reset();
  },

  _onClose: function() {
    if (Vertex.count() < 2 || State.closed || State.dimension > 2) return;
    Buttons.flash('close');
    State.closed = true;
  },

  _onStepUp: function() {
    if (!State.closed) return;
    Buttons.flash('stepup');
    StepUp.execute();
  }
};
