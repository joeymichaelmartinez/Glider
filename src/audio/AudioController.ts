import * as Tone from "tone";
export class AudioController {
  private synth = new Tone.PolySynth(Tone.Synth, {oscillator: {type: "amsine", modulationType: "sine"}, envelope: {attack: 0.002, attackCurve: "exponential", decay: 0.05, decayCurve:"exponential", sustain: 0.2 }, volume: -12}).toDestination();
  private reverb = new Tone.Reverb({decay: 15, wet: 1}).toDestination();
  private lastPlayed = Date.now();
  constructor() {
    this.synth.connect(this.reverb);
  }
  play() {
    let currentTimeDifference = Date.now() - this.lastPlayed;
    if(currentTimeDifference > 125) {
      this.lastPlayed = Date.now();
      let notes = ["C3", "D3", "F3", "G3", "A3", "C4", "D4", "F4", "G4", "A4", "C5"];
      let i = Math.floor(Math.random() * notes.length);
      let r = notes[i];
      this.synth.triggerAttackRelease(r, "16n");
    }
  }
}