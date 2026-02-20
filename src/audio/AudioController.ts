import * as Tone from "tone";

export class AudioController {
  private synth = new Tone.Synth().toDestination();
  play() {
    this.synth.triggerAttackRelease("C4", "8n");
  }
}