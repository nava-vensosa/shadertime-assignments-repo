import Engine from './Engine.js';
import Sun from './Sun.js';
import AudioEngine, { SAMPLE_CATALOG } from './AudioEngine.js';
import SystemManager from './SystemManager.js';

const canvas = document.getElementById('canvas');
const engine = new Engine(canvas);
const systemManager = new SystemManager();
const audioEngine = new AudioEngine();

// UI elements
const panelTitle = document.getElementById('panel-title');
const panelContent = document.getElementById('panel-content');
const panel = document.getElementById('panel');

// Create default sun
let sun = new Sun({ name: 'Sol', clockrate: 100, cycles: 0 });
engine.setSun(sun);

// Purdie shuffle on 12-subdivision triplet grid (all planets aligned)
// Positions: 0=beat1, 1=trip-&, 2=trip-a, 3=beat2, 4=trip-&, 5=trip-a, 6=beat3, ...
const kick = sun.addPlanet({
  name: 'Kick', transits: 12, extrema: { x: 0, y: 0 }, rotation: 0, multiplier: 15,
  sampleName: 'HR-16/Kick',
  tickToggles: [true, false, false, false, false, true, false, false, false, false, false, false],
});
const snare = sun.addPlanet({
  name: 'Snare', transits: 12, extrema: { x: 0, y: 0 }, rotation: 0, multiplier: 15,
  sampleName: 'HR-16/Snare',
  tickToggles: [false, false, false, false, false, false, true, false, false, false, false, false],
});
const chh = sun.addPlanet({
  name: 'Closed HH', transits: 12, extrema: { x: 0, y: 0 }, rotation: 0, multiplier: 15,
  sampleName: 'HR-16/Closed HH',
  tickToggles: [true,false,true, true,false,true, true,false,true, true,false,true],
});
const ohh = sun.addPlanet({
  name: 'Open HH', transits: 12, extrema: { x: 0, y: 0 }, rotation: 0, multiplier: 15,
  sampleName: 'HR-16/Open HH',
  tickToggles: [false,true,false, false,true,false, false,true,false, false,true,false],
});

// Wire audio triggers for all planets
function wireAudio(body) {
  if (body.sampleName) {
    body._onTickTrigger = () => audioEngine.play(body.sampleName);
  }
  for (const child of body.children) {
    wireAudio(child);
  }
}
wireAudio(sun);

// Selection handler
engine.onSelect = (body) => {
  if (!body) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');
  showPanel(body);
};

function showPanel(body) {
  panelTitle.textContent = body.name;
  panelContent.innerHTML = '';

  if (body.constructor.name === 'Sun') {
    panelContent.appendChild(buildSunPanel(body));
  } else {
    panelContent.appendChild(buildOrbitalPanel(body));
  }
}

function createField(label, value, type, onChange) {
  const row = document.createElement('div');
  row.className = 'field-row';

  const lbl = document.createElement('label');
  lbl.textContent = label;
  row.appendChild(lbl);

  const input = document.createElement('input');
  input.type = type || 'text';
  input.value = value;
  if (type === 'number') {
    input.step = 'any';
  }
  input.addEventListener('change', () => onChange(input.value));
  row.appendChild(input);

  return row;
}

function createButton(label, onClick, className = '') {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = className;
  btn.addEventListener('click', onClick);
  return btn;
}

function createSampleField(body) {
  const row = document.createElement('div');
  row.className = 'field-row';

  const lbl = document.createElement('label');
  lbl.textContent = 'Sample';
  row.appendChild(lbl);

  const inputWrap = document.createElement('div');
  inputWrap.className = 'sample-input-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = body.sampleName || '';
  input.addEventListener('change', () => {
    body.sampleName = input.value || null;
    wireAudio(body);
  });
  inputWrap.appendChild(input);

  const folderBtn = document.createElement('button');
  folderBtn.className = 'sample-folder-btn';
  folderBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

  const dropdown = document.createElement('div');
  dropdown.className = 'sample-dropdown hidden';

  for (const kitName in SAMPLE_CATALOG) {
    for (const sampleKey in SAMPLE_CATALOG[kitName]) {
      const fullPath = `${kitName}/${sampleKey}`;
      const option = document.createElement('div');
      option.className = 'sample-option';
      option.textContent = fullPath;
      option.addEventListener('click', () => {
        input.value = fullPath;
        body.sampleName = fullPath;
        wireAudio(body);
        dropdown.classList.add('hidden');
      });
      dropdown.appendChild(option);
    }
  }

  folderBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  const closeDropdown = () => dropdown.classList.add('hidden');
  document.addEventListener('click', closeDropdown, { once: false });
  // Clean up when panel rebuilds — relies on DOM removal stopping events naturally

  inputWrap.appendChild(folderBtn);
  inputWrap.appendChild(dropdown);
  row.appendChild(inputWrap);

  return row;
}

function buildSunPanel(sunBody) {
  const frag = document.createDocumentFragment();

  frag.appendChild(createField('Name', sunBody.name, 'text', (v) => {
    sunBody.name = v;
    panelTitle.textContent = v;
  }));
  frag.appendChild(createField('BPM', sunBody.clockrate, 'number', (v) => {
    sunBody.clockrate = parseFloat(v) || 120;
  }));
  frag.appendChild(createField('Cycles', sunBody.cycles, 'number', (v) => {
    sunBody.cycles = parseInt(v) || 16;
  }));
  frag.appendChild(createField('Next JSON', sunBody.next || '', 'text', (v) => {
    sunBody.next = v || null;
  }));

  // Audio on/off toggle
  const audioRow = document.createElement('div');
  audioRow.className = 'audio-toggle-row';
  const audioLabel = document.createElement('label');
  audioLabel.textContent = 'Audio';
  audioRow.appendChild(audioLabel);
  const audioBtn = document.createElement('button');
  audioBtn.className = 'audio-toggle' + (audioEngine.muted ? '' : ' active');
  audioBtn.textContent = audioEngine.muted ? 'Off' : 'On';
  audioBtn.addEventListener('click', () => {
    audioEngine.muted = !audioEngine.muted;
    if (!audioEngine.muted) audioEngine._ensureContext();
    audioBtn.classList.toggle('active', !audioEngine.muted);
    audioBtn.textContent = audioEngine.muted ? 'Off' : 'On';
  });
  audioRow.appendChild(audioBtn);
  frag.appendChild(audioRow);

  const actions = document.createElement('div');
  actions.className = 'actions';

  actions.appendChild(createButton('Add Planet', () => {
    const p = sunBody.addPlanet({});
    sunBody._buildRays();
    wireAudio(p);
    showPanel(sunBody);
  }));

  actions.appendChild(createButton('Save System', () => {
    systemManager.saveSystem(sunBody);
  }));

  actions.appendChild(createButton('Load System', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', async () => {
      if (input.files[0]) {
        try {
          const newSun = await systemManager.loadSystem(input.files[0]);
          sun = newSun;
          engine.setSun(sun);
          wireAudio(sun);
          showPanel(sun);
        } catch (err) {
          console.error('Failed to load system:', err);
        }
      }
    });
    input.click();
  }));

  frag.appendChild(actions);

  // Planet list
  if (sunBody.children.length > 0) {
    const list = document.createElement('div');
    list.className = 'child-list';
    const h = document.createElement('h4');
    h.textContent = 'Planets';
    list.appendChild(h);
    for (const planet of sunBody.children) {
      const item = document.createElement('div');
      item.className = 'child-item';
      item.textContent = planet.name;
      item.addEventListener('click', () => {
        engine.selectedBody = planet;
        showPanel(planet);
      });
      list.appendChild(item);
    }
    frag.appendChild(list);
  }

  return frag;
}

function buildOrbitalPanel(body) {
  const frag = document.createDocumentFragment();

  frag.appendChild(createField('Name', body.name, 'text', (v) => {
    body.name = v;
    panelTitle.textContent = v;
  }));
  frag.appendChild(createSampleField(body));
  frag.appendChild(createField('BPM', body.clockrate, 'number', (v) => {
    body.clockrate = parseFloat(v) || 120;
  }));
  frag.appendChild(createField('Transits', body.transits, 'number', (v) => {
    body.transits = parseInt(v) || 4;
    body.rebuildOrbits();
    if (sun) sun._buildRays();
    showPanel(body);
  }));
  frag.appendChild(createField('Extrema X', body.extrema.x, 'number', (v) => {
    body.extrema.x = parseFloat(v) || 0;
    body.rebuildOrbits();
  }));
  frag.appendChild(createField('Extrema Y', body.extrema.y, 'number', (v) => {
    body.extrema.y = parseFloat(v) || 0;
    body.rebuildOrbits();
  }));
  frag.appendChild(createField('Rotation (deg)', body.rotation, 'number', (v) => {
    body.rotation = parseFloat(v) || 0;
    body.rebuildOrbits();
  }));
  frag.appendChild(createField('Multiplier', body.multiplier, 'number', (v) => {
    body.multiplier = parseFloat(v) || 1;
  }));
  frag.appendChild(createField('Orbit Radius', body.orbitRadius, 'number', (v) => {
    body.orbitRadius = parseFloat(v) || 5;
    body.rebuildOrbits();
  }));

  // Tick toggle section
  const tickSection = document.createElement('div');
  tickSection.className = 'tick-section';
  const tickLabel = document.createElement('label');
  tickLabel.textContent = 'Tick Marks';
  tickSection.appendChild(tickLabel);

  const tickGrid = document.createElement('div');
  tickGrid.className = 'tick-grid';

  for (let i = 0; i < body.transits; i++) {
    const btn = document.createElement('button');
    btn.className = 'tick-toggle' + (body.tickToggles[i] ? ' active' : '');
    btn.textContent = i + 1;
    const idx = i;
    btn.addEventListener('click', () => {
      const enabled = !body.tickToggles[idx];
      body.setTickEnabled(idx, enabled);
      btn.classList.toggle('active', enabled);
    });
    tickGrid.appendChild(btn);
  }

  tickSection.appendChild(tickGrid);
  frag.appendChild(tickSection);

  const actions = document.createElement('div');
  actions.className = 'actions';

  if (!body.isSatellite) {
    actions.appendChild(createButton('Add Satellite', () => {
      const sat = body.addSatellite({});
      wireAudio(sat);
      showPanel(body);
    }));
  }

  actions.appendChild(createButton('Remove', () => {
    const parent = body.parent;
    if (parent) {
      parent.removeChild(body);
      if (sun) sun._buildRays();
      if (parent === sun) {
        showPanel(sun);
        engine.selectedBody = sun;
      } else {
        showPanel(parent);
        engine.selectedBody = parent;
      }
    }
  }, 'danger'));

  frag.appendChild(actions);

  // Satellite list
  if (body.children.length > 0) {
    const list = document.createElement('div');
    list.className = 'child-list';
    const h = document.createElement('h4');
    h.textContent = 'Satellites';
    list.appendChild(h);
    for (const sat of body.children) {
      const item = document.createElement('div');
      item.className = 'child-item';
      item.textContent = sat.name;
      item.addEventListener('click', () => {
        engine.selectedBody = sat;
        showPanel(sat);
      });
      list.appendChild(item);
    }
    frag.appendChild(list);
  }

  // Back to parent
  if (body.parent) {
    const back = createButton(`← ${body.parent.name}`, () => {
      engine.selectedBody = body.parent;
      showPanel(body.parent);
    });
    back.className = 'back-btn';
    frag.appendChild(back);
  }

  return frag;
}

// Start engine
engine.start();

// Show sun panel by default
showPanel(sun);
panel.classList.remove('hidden');
