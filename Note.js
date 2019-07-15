

class Note extends GameObject{
    constructor(parent, freq){
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
        this.minStayClickedTime = 10;
        this.isPlaying = false;

        this.hasAnnouncedOwnPresence = false; //first time update() is called, play your note once
    }
    draw(context){

        if(!this.hasAnnouncedOwnPresence)return;


        this.pos = this.parent.freqToRenderPos(this.frequency);



        
        //a small line poking out from the circle, so you can see that it's not quite equal temperament
        if(this.parent.showEqualTemperamentLines){
            context.beginPath();
            context.lineWidth = 3;
            context.strokeStyle = "black"
            context.moveTo(...this.parent.freqToRenderPos(this.frequency,-80));
            context.lineTo(...this.parent.freqToRenderPos(this.frequency,80));
            context.stroke();
        }


        //the white circle
        context.fillStyle = "white";

        if(this.isPlaying)context.fillStyle = "#ffd";

        drawCircle(context, this.pos[0],this.pos[1],this.currentRadius);

        //the note frequency text
        context.fillStyle = "black";
        context.font = "16" + "px calibri";
        drawCenteredText(context, formatFreq(this.frequency),  this.pos[0],this.pos[1]);

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
            if(dist([x,y],this.pos) < 20){
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
        this.parent.synth.triggerAttack(this.parent.mainOctavize(this.frequency));
        this.changeColorDueToClick();
    }
    onmouseup(x,y){
        this.parent.synth.triggerRelease(this.parent.mainOctavize(this.frequency));
        this.onmousemove(x,y);
    }
}
