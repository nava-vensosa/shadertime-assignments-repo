import Sun from './Sun.js';

export default class SystemManager {
  constructor() {
    this.currentSystem = null;
  }

  saveSystem(sun) {
    const data = sun.toJSON();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sun.name || 'system'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return data;
  }

  loadSystem(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const sun = Sun.fromJSON(data);
          resolve(sun);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  loadFromJSON(data) {
    return Sun.fromJSON(data);
  }

  beatsToSeconds(beats, bpm) {
    return (beats / bpm) * 60;
  }

  secondsToBeats(seconds, bpm) {
    return (seconds * bpm) / 60;
  }

  measureDuration(bpm) {
    // 60 beats per measure
    return this.beatsToSeconds(60, bpm);
  }
}
