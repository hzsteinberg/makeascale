

class FirstNote extends Note{
    constructor(parent){
        super(parent, 880);
        this.hasAnnouncedOwnPresence = true;
        this.creationDelay = 0;
        this.beingDragged = false;

        this.showDragText = true;
    }
    draw(context){
        this.pos = this.parent.freqToRenderPos(this.frequency);

        //the circle
        let angle = this.parent.freqToAngle(this.frequency);
        let hueVal = ((angle/Math.PI/2 + 0.5)*360 + 180+35)%360;

        context.fillStyle = "hsl("+hueVal+",100%,90%)";

        drawCircle(context, this.pos[0],this.pos[1],this.currentRadius);

        //the note frequency text
        context.fillStyle = "black";
        context.font = "16" + "px calibri";
        drawCenteredText(context, formatFreq(this.frequency),  this.pos[0],this.pos[1]);

        context.strokeStyle = "black"
        drawCircleStroke(context, this.pos[0],this.pos[1],this.currentRadius * 2);

        context.fillStyle = "rgba(0,0,0,"+((this.currentRadius)/this.defaultRadius)+")";
        context.font = "20" + "px calibri";

        let textPos = this.parent.freqToRenderPos(this.frequency, -200)

        drawCenteredText(context, "Start scale using this as",  textPos[0], textPos[1]);
        drawCenteredText(context, "the fundamental frequency?", textPos[0],textPos[1] + 25);
        drawCenteredText(context, "Press \"Start\" when ready.", textPos[0],textPos[1] + 75);

        if(this.showDragText){
    
            let textPos = this.parent.freqToRenderPos(this.frequency, 100)
            drawCenteredText(context, "(Drag me!)", textPos[0],textPos[1]);
        }
    }
    confirmSelection(){
        if(!this.selectionConfirmed){
            this.selectionConfirmed = true;
            this.targetRadius = -1;

            this.parent.fundamentalFreq = this.frequency;
            this.parent.objects = this.parent.objects.concat([
                 new Note(this.parent, this.frequency, true),
                 new NoteArrow(this.parent, this.frequency, "+", true),
                 new NoteArrow(this.parent, this.frequency, "+", false)]);
            this.parent.numNotes++;
        }

    }

    onmousedown(x,y){
      if(dist([x,y],this.pos) < 60){
        this.beingDragged = true;
        this.showDragText = false;
      }
    }
    onmouseup(x,y){
        this.beingDragged = false;
    }
    onmousemove(x,y){
        //convert mouse angle to this

        if(this.selectionConfirmed)return;
        if(!this.beingDragged)return;

        if(this.parent.currentMode == "linear"){
            let xPos = x/this.parent.width;
            let exponent = xPos * 2;

            this.frequency = 440 * 2**(exponent);
        }else if(this.parent.currentMode == "radial"){

            let angle = Math.atan2(y-this.parent.centerPos[1],x-this.parent.centerPos[0]);
           
            let exponent = (angle) / Math.PI /2 //now from -0.5 to 0.5

            this.frequency = 440 * 2**(exponent);
        }else{
        }
    }
}
