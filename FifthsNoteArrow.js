

class FifthsNoteArrow extends GameObject{
    constructor(parent, freq, isRight=false){
        super();
        this.frequency = freq;
        this.pos = [0,0];

        this.parent = parent;
        this.isRight = isRight;

        this.opacity = 0;
        this.targetOpacity = 0;
        this.opacityDelay = 40;

        this.staffOffset = 40;
        this.arrowArcHeight = 60;

        this.arrowSize = 15;

        this.pitchBuffer = 0.1; //to ensure we don't overshoot
    }

    arcPosition(frequency, pitchMultiplier){
      
        let sineOffset = (pitchMultiplier-this.pitchBuffer+0.01)/(Math.log2(3/2)-this.pitchBuffer*2+0.02);
        let arcVal = 40*Math.sin(sineOffset* Math.PI); //move out and in radially to form an arc
        arcVal = this.arrowArcHeight * Math.sqrt(1-(2*sineOffset-1)**2);


        let multiplier = 2**pitchMultiplier;
        if(!this.isRight){
            multiplier = 1/multiplier;
        }


      return this.parent.freqToRenderPos(this.frequency * multiplier, this.staffOffset + arcVal);
    }

    draw(context){

        this.pos = this.arcPosition(this.frequency, this.pitchBuffer);

        context.strokeStyle = "hsla(0,0%,100%, "+this.opacity+")";
        context.beginPath();
        context.lineWidth = 2;
        context.moveTo(this.pos[0],this.pos[1])
        for(var i=this.pitchBuffer;i<=Math.log2(3/2)-this.pitchBuffer;i+=(1/60)){
            let pos = this.arcPosition(this.frequency, i);
            context.lineTo(pos[0],pos[1]);
        }
        context.stroke();

        //arrow
        context.fillStyle = "hsla(0,0%,100%,"+this.opacity+")";
        let endingPos = this.arcPosition(this.frequency, Math.log2(3/2-this.pitchBuffer));
        let bitBeforeEndingPos = this.arcPosition(this.frequency, Math.log2(3/2-this.pitchBuffer)-0.01);

        let distance = dist(endingPos, bitBeforeEndingPos);
        let direction = endingPos.map((x,i) => (endingPos[i] - bitBeforeEndingPos[i])/distance);
        let arrowCenterPos = vecAdd(endingPos, vecScale(direction,-this.arrowSize));
        drawTriangleInDirection(context, arrowCenterPos, endingPos);

        //text
        context.font = "32" + "px bold calibri";
        context.fillStyle = "hsla(0,0%,0%,"+this.opacity+")";

        let midpointMultiplier = 2**(Math.log2(Math.sqrt(3/2)));
        let text = "*3/2";
        if(!this.isRight){
            midpointMultiplier = 1/midpointMultiplier
            text = "*2/3";
        }

        let midpos = this.parent.freqToRenderPos(this.frequency * midpointMultiplier, this.staffOffset + 20);
        drawCenteredText(context, text,  midpos[0],midpos[1]);

    }
    update(dt){
        //show only in fifths mode and once fifths transition has taken place
        this.targetOpacity = (this.parent.currentMode == "fifths" && this.parent.targetMode == "fifths") ? 1 : 0;

        if(this.opacity != this.targetOpacity){
            this.opacity += Math.sign(this.targetOpacity - this.opacity) * 0.1 * dt;

            if(Math.abs(this.opacity - this.targetOpacity) < 0.1){
                this.opacity = this.targetOpacity; //end movement
            }
        }
        this.opacity = Math.min(1, Math.max(0, this.opacity)); //clamp to 0-1
    }
}
