

class Note extends GameObject{
    constructor(parent, freq, hasHalo=false){
        super();
        this.frequency = freq;
        this.pos = [0,0];

        this.parent = parent;

        this.noteName = this.frequency; //unused right now

        this.defaultRadius = 25;
        this.hoverRadius = 27;
        this.targetRadius = this.defaultRadius;


        this.currentRadius = 0;
        this.radiusSpeed = 3;

        this.creationDelayTimer = 0;
        this.creationDelay = 40;

        this.clickTimer = 0;
        this.minStayClickedTime = 15;
        this.isPlaying = false;

        this.hasHalo = hasHalo;

        this.hasAnnouncedOwnPresence = false; //first time update() is called, play your note once
    }

    drawNoteCircle(context, pos, frequency){
        let angle = this.parent.freqToAngle(frequency)// - this.parent.freqToAngle(440);
        let hueVal = ((angle/Math.PI/2 + 0.5)*360 + 180)%360;

        let noteColor = "hsl("+hueVal+",100%,90%)";
        if(this.isPlaying)noteColor = "hsl("+hueVal+",90%,80%)";
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
        drawCenteredText(context, formatFreq(frequency),  pos[0],pos[1]);

    }

    draw(context){

        if(!this.hasAnnouncedOwnPresence)return;

        this.pos = this.parent.freqToRenderPos(this.frequency);

        //the circle
        this.drawNoteCircle(context, this.pos, this.frequency);

        //if linear, draw echoes at other octaves
        if(this.parent.mode == 'linear'){
            const numOctaveEchoes = 2;
            for(var i=-numOctaveEchoes; i<numOctaveEchoes;i++){
                if(i==0)continue
    
                    let pos = this.parent.freqToRenderPos(this.frequency * (2**i));

                    this.drawNoteCircle(context, pos, this.frequency);
    
            }

        }

    }
    update(dt){
        //first time update() is called, play self
        this.creationDelayTimer += dt;
        if(this.creationDelayTimer < this.creationDelay)return;

        if(!this.hasAnnouncedOwnPresence){
             this.hasAnnouncedOwnPresence = true;
            this.parent.synth.triggerAttackRelease(this.parent.mainOctavize(this.frequency), 0.05);
        }

        //update timer so circle stops being yellow after being clicked 
        if(this.isPlaying){
            this.clickTimer++;
            if(this.clickTimer > this.minStayClickedTime && !this.clicked){
                this.isPlaying = false;
                this.clickTimer = 0;
                this.parent.synth.triggerRelease(this.parent.mainOctavize(this.frequency));
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
            if(dist([x,y],this.pos) < 30){
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
    onclick(){
        if(!this.isPlaying){
            this.parent.synth.triggerAttack(this.parent.mainOctavize(this.frequency));
        }
        this.changeColorDueToClick();
    }
    onmouseup(x,y){
        //this.clicked is set to false, which will turn off the note next update();
        this.onmousemove(x,y);
    }
}
