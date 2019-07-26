

class NoteArrow extends GameObject{
    constructor(parent, freq, text, isFacingRight = true){
        super();
        this.pos = [0,0];

        this.frequency = freq;

        this.noteDistance = 30;

        this.isFacingRight = isFacingRight


        this.arrowDistanceProbeValue = 1.02; //controls direction of arrow. 
        if(this.isFacingRight === false){
            this.arrowDistanceProbeValue = 1/this.arrowDistanceProbeValue;
        }

        this.parent = parent;
        this.text = text;
        this.clickedOnce = false;

        this.size = 0;
        this.dSize = 3;
        this.maxSize = 20;


        this.creationDelayTimer = 0;
        this.creationDelay = 40;
    }

    drawTriangleAtFreq(context, centerPos, tipPos){
        context.fillStyle = "white";
        if(this.clickedOnce)context.fillStyle = "#ffd";

        drawTriangleInDirection(context, centerPos, tipPos);

        context.fillStyle = "black";
        context.font = "16" + "px calibri";
        drawCenteredText(context, this.text,  centerPos[0],centerPos[1]);
    }

    calcTangentDirection(frequency){
        let pos = this.parent.freqToRenderPos(frequency, 40);

        //query slightly beyond to figure out what direction to place the triangle tip
        let pos2 = this.parent.freqToRenderPos(frequency *  this.arrowDistanceProbeValue, 40);

        //make the arrow go in that direction with a dist of 30
        let distance = dist(pos2, pos);
        let direction = pos.map((x,i) => (pos2[i] - pos[i])/distance);
        return direction;
    }

    calcArrowPos(frequency){
        //draw note arrow
        let centerNotePos = this.parent.freqToRenderPos(frequency, 40);
        let direction = this.calcTangentDirection(frequency);

        //place triangle slightly away from center point
        return vecAdd(centerNotePos, vecScale(direction,this.noteDistance));
    }

    draw(context){
        if(this.creationDelayTimer < this.creationDelay)return;

        //draw note arrow
        let centerNotePos = this.parent.freqToRenderPos(this.frequency, 40);
        let direction = this.calcTangentDirection(this.frequency);

        //place triangle slightly away from center point
        this.pos = this.calcArrowPos(this.frequency);

        //draw triangle further out in the proper direction
        this.drawTriangleAtFreq(context, this.pos, vecAdd(this.pos,vecScale(direction,this.size)));

        //draw a small white circle so it looks a bit more even
        context.fillStyle = "white";
        drawCircle(context, centerNotePos[0],centerNotePos[1],this.size/3);

        //if linear, draw echoes at other octaves
        if(this.parent.currentMode == 'linear'){
            const numOctaveEchoes = 2;
            for(var i=-numOctaveEchoes; i<numOctaveEchoes;i++){
                if(i==0)continue
                    let echoFrequency = this.frequency * (2**i);

                    let centerNotePos = this.parent.freqToRenderPos(echoFrequency, 40);
                    let direction = this.calcTangentDirection(echoFrequency);

                    //place triangle slightly away from center point
                    let arrowPos = this.calcArrowPos(echoFrequency);

                    //draw triangle further out in the proper direction
                    this.drawTriangleAtFreq(context, arrowPos, vecAdd(arrowPos,vecScale(direction,this.size)));

                    //draw a small white circle so it looks a bit more even
                    context.fillStyle = "white";
                    drawCircle(context, centerNotePos[0],centerNotePos[1],this.size/3);
    
            }
        }

    }
    onmousedown(x,y){
        if(!this.clickedOnce){

            if(this.parent.currentMode == 'linear'){
                const numOctaveEchoes = 2;
                for(var i=-numOctaveEchoes; i<numOctaveEchoes;i++){
                      let echoFreq = this.frequency * (2**i);
                      let pos = this.calcArrowPos(echoFreq);
                      if(dist([x,y],pos) < 30){
                            this.clickedOnce = true;
                            this.parent.makeANewTone(this.frequency, this.isFacingRight, echoFreq);
                            this.deleteSelf();
                            return;
                      }
                }
            }else{
                //non-linear mode
                if(dist([x,y],this.pos) < 30){
                    this.clickedOnce = true;
                    this.parent.makeANewTone(this.frequency, this.isFacingRight);
                    this.deleteSelf();
                }
            }
        }
    }
    update(dt){
        this.creationDelayTimer += dt;
        if(this.creationDelayTimer < this.creationDelay)return;

        this.size += this.dSize * dt;
        if(this.size > this.maxSize){
            this.size = this.maxSize;
            this.dSize = 0;
        }
        if(this.size < 0){
            this.size = 0;
            this.dSize = 0;
            this.isDead = true;
        }
    }
    deleteSelf(){
        this.dSize = -3;
    }
}
