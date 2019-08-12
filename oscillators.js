class Synth {

  constructor(context, maxNoteLength=5) {
    this.context = context;
    this.maxNoteLength = maxNoteLength;
    this.initialized = false;

    this.attack = 0;
    this.delay = 0.2;
    this.sustain = 0.2;
    this.release = 1.2;

    this.notePlaying = false;
  }

  init() {
    this.oscillator = this.context.createOscillator();
    this.gainNode = this.context.createGain();

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.oscillator.type = 'sine';

    this.initialized = true;
  }
  triggerAttackRelease(freq, duration, delay=0){
    //this.stop();
    this.init();
    let time = this.currentTime;
    this.play(freq, delay);
    this.stopAtTime(this.currentTime() + duration + delay);
  }

  play(freq, delay=0) {
    //this.stop();
    this.init();
    let time = this.currentTime() + delay;

    
    this.oscillator.frequency.value = freq;
    this.gainNode.gain.setValueAtTime(0.0001, time);
    this.gainNode.gain.exponentialRampToValueAtTime(1, time+this.attack);
    this.gainNode.gain.exponentialRampToValueAtTime(this.sustain, time+this.attack+this.delay);
            
    this.oscillator.start(time);
    this.stopAtTime(time+this.maxNoteLength );
  }

  setFreq(freq){
      this.oscillator.frequency.setValueAtTime(freq, this.currentTime());
  }
  currentTime(){
      return this.context.currentTime;
  }

  stop() {
    if(!this.initialized)return;
    this.stopAtTime(this.currentTime() + this.release);
  }
  stopAtTime(time){
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, time);
    this.oscillator.stop(time);
    
    this.gainNode.gain.cancelScheduledValues(time + 1/60); 
  }
}
