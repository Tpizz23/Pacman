export class Audio {
  constructor(enabled=true){this.enabled=enabled;this.context=null;this.lastPellet=0;}
  unlock(){if(!this.enabled)return;try{const Context=window.AudioContext||window.webkitAudioContext;if(Context){this.context??=new Context();this.context.resume().catch(()=>{});}}catch{}}
  toggle(){this.enabled=!this.enabled;if(!this.enabled)this.cancelSpeech();else this.unlock();return this.enabled;}
  play(event) {
    if(!this.enabled||!this.context||this.context.state!=='running')return;
    const now=this.context.currentTime;
    if(event==='pellet'&&now-this.lastPellet<.12)return;
    if(event==='pellet')this.lastPellet=now;
    const sequences={pellet:[440],power:[392,523,659],correct:[523,659,784],wrong:[220,196],answered:[330],life:[523,659,784,1047],ghost:[784,1047],lost:[392,330,262],level:[392,523]};
    (sequences[event]||[]).forEach((frequency,i)=>{
      const oscillator=this.context.createOscillator(),gain=this.context.createGain(),start=now+i*.1;
      oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.06,start+.01);gain.gain.exponentialRampToValueAtTime(.001,start+.13);
      oscillator.connect(gain);gain.connect(this.context.destination);oscillator.start(start);oscillator.stop(start+.14);
    });
  }
  get speechAvailable(){return 'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;}
  speak(text){if(!this.enabled||!this.speechAvailable)return;try{this.cancelSpeech();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.85;utterance.pitch=1.1;window.speechSynthesis.speak(utterance);}catch{}}
  cancelSpeech(){if(this.speechAvailable)try{window.speechSynthesis.cancel();}catch{}}
}
