class Note extends GameObject{
    /*
    A note of the scale, with an associated frequency. Clicking on one produces a tone.

    In linear mode, one Note will also draw "echo notes" that display the same note in different octaves.
    */
    constructor(parent, freq, hasHalo=false){
        super();
        this.frequency = freq;
        this.pos = [0,0];

        this.parent = parent;

        this.noteName = this.frequency; //unused right now

        this.defaultRadius = 25;
        this.hoverRadius = 27;
        this.targetRadius = this.defaultRadius;


        this.currentPlayingFrequency = this.frequency;

        this.currentRadius = 0;
        this.radiusSpeed = 3;

        this.creationDelayTimer = 0; //for the growing animation when first created
        this.creationDelay = 40;

        this.clickTimer = 0; //after being clicked, change color for a little bit and play the note
        this.minStayClickedTime = 10;
        this.isPlaying = false;

        this.hasHalo = hasHalo;

        this.hasAnnouncedOwnPresence = false; //first time update() is called, play your note once

        this.synth = new Synth(this.parent.audioContext);
    }

    drawNoteCircle(context, pos, frequency, isEcho=false){
        let angle = this.parent.radialFreqToAngle(frequency)
        let hueVal = ((angle/Math.PI/2 + 0.5)*360 + 180)%360;

        let opacity = isEcho ? 0.5: 1.0;

        let noteColor = "hsla("+hueVal+",100%,90%, "+opacity+")";
        if(this.isPlaying)noteColor = "hsla("+hueVal+",90%,80%,"+opacity+")";
        context.fillStyle = noteColor;

        //a small line poking out from the circle, so you can see that it's not quite equal temperament
        if(this.parent.showEqualTemperamentLines){
            context.beginPath();
            context.lineWidth = 4;
            context.strokeStyle = noteColor;
            context.moveTo(...this.parent.freqToRenderPos(frequency,-80));
            context.lineTo(...this.parent.freqToRenderPos(frequency,80));
            context.stroke();
        }

        drawCircle(context, pos[0],pos[1],this.currentRadius);

        if(this.hasHalo){
            context.strokeStyle = "white";
            drawCircleStroke(context, pos[0],pos[1],this.currentRadius*1.4);
        }

        //the note frequency text
        context.fillStyle = "black";
        context.font = "16" + "px calibri";

        let text = formatFreq(frequency);
        if(this.parent.currentMode == "radial"){
            text = formatFreq(this.parent.mainOctavize(frequency));
        }

        drawCenteredText(context, text, pos[0], pos[1]);

    }

    draw(context){

        if(!this.hasAnnouncedOwnPresence)return;

        this.pos = this.parent.freqToRenderPos(this.frequency);

        //the circle
        this.drawNoteCircle(context, this.pos, this.frequency);

        //if linear, draw echoes at other octaves
        if(this.parent.currentMode == 'linear'){
            const numOctaveEchoes = 8;
            for(var i=-numOctaveEchoes; i<=numOctaveEchoes;i++){
                if(i==0)continue

                    let newFreq = this.frequency * (2**i);
    
                    let pos = this.parent.freqToRenderPos(newFreq);

                    this.drawNoteCircle(context, pos, newFreq, true);
    
            }
        }

    }
    update(dt){
        //first time update() is called, play self
        this.creationDelayTimer += dt;
        if(this.creationDelayTimer < this.creationDelay)return;

        if(!this.hasAnnouncedOwnPresence){
             this.hasAnnouncedOwnPresence = true;
            
            this.currentPlayingFrequency = this.parent.mainOctavize(this.frequency);
            this.synth.triggerAttackRelease(this.currentPlayingFrequency, 1.5);
        }

        //update timer so circle stops being yellow after being clicked 
        if(this.isPlaying){
            this.clickTimer++;
            if(this.clickTimer > this.minStayClickedTime && !this.clicked){
                this.isPlaying = false;
                this.clickTimer = 0;
                this.synth.stop();
                this.currentPlayingFrequency = 0;
            }
        }


        //shrinking
        if(this.currentRadius > this.targetRadius){
            let delta = -this.radiusSpeed * dt;
            let nextRadius = this.currentRadius + delta;

            this.currentRadius = nextRadius;
            if(nextRadius < this.targetRadius){
                this.currentRadius = this.targetRadius; //end movement
            }
        }
        //growing
        if(this.currentRadius < this.targetRadius){
            let delta = this.radiusSpeed * dt;
            let nextRadius = this.currentRadius + delta;

            this.currentRadius = nextRadius;
            if(nextRadius > this.targetRadius){
                this.currentRadius = this.targetRadius; //end movement
            }
        }

        if(this.currentRadius < 0){
            this.currentRadius = 0;
            this.isDead = true;
        }
    }
    onmousemove(x,y){
        if(!this.clicked){
            let isHovered = false;

            //test center for hovering
            if(dist([x,y],this.pos) < 30){
                isHovered = true;
            }

            //test echoes if there are any
            if(this.parent.currentMode == 'linear' || this.parent.targetMode == "linear"){
                const numOctaveEchoes = 8;
                for(var i=-numOctaveEchoes; i<=numOctaveEchoes;i++){
                    let echoFreq = this.frequency * (2**i);
                    let pos = this.parent.freqToRenderPos(echoFreq);

                    if(dist([x,y],pos) < 30){
                        isHovered = true;
                    }
                }
            }
            if(isHovered){
                this.targetRadius = this.hoverRadius;
            }else{
                this.targetRadius = this.defaultRadius;
            }
        }
    }

    changeColorDueToClick(){
        this.isPlaying = true;
        this.clickTimer = 0;
        this.targetRadius = this.defaultRadius;
    }

    beginToPlay(freq){

        if(freq === undefined){
            freq = this.parent.mainOctavize(this.frequency);
        }

        if(!this.isPlaying){
            this.synth.play(freq);
            this.isPlaying = true;
            this.currentPlayingFrequency = freq;
        }
        this.changeColorDueToClick();
    }
    onmousedown(x,y){
      //test this and echoes for clicking.
      if(this.parent.currentMode == 'linear'){
          const numOctaveEchoes = 8;
          for(var i=-numOctaveEchoes; i<numOctaveEchoes;i++){
                let echoFreq = this.frequency * (2**i);
                let pos = this.parent.freqToRenderPos(echoFreq);
                if(dist([x,y],pos) < 30){
                      this.clicked = true;
                      this.beginToPlay(echoFreq);
                      return;
                }
          }
      }
      //make sure you can be clicked in other modes too
      if(dist([x,y],this.pos) < 30){
            this.clicked = true;
            this.beginToPlay();
            return;
      }
    }
    onmouseup(x,y){
        //this.clicked is set to false, which will turn off the note next update();
        this.onmousemove(x,y);
    }
}
