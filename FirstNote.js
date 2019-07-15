

class FirstNote extends Note{
    constructor(parent){
        super(parent, 440);
    }
    draw(context){
        if(!this.hasAnnouncedOwnPresence)return;


        this.pos = this.parent.freqToRenderPos(this.frequency);

        //the circle
        let angle = this.parent.freqToAngle(this.frequency);
        let hueVal = (angle/Math.PI/2 + 0.5)*360;

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
        drawCenteredText(context, "Start scale here?",  ...this.parent.freqToRenderPos(this.frequency, -200));
    }
    onmousedown(x,y){
        if(!this.clickedOnce){
            this.clickedOnce = true;
            this.targetRadius = -1;

            this.parent.fundamentalFreq = this.frequency;
            this.parent.objects = this.parent.objects.concat([
                 new Note(this.parent, this.frequency, true),
                 new NoteArrow(this.parent, this.frequency, "+", true),
                 new NoteArrow(this.parent, this.frequency, "+", false)]);
            this.parent.numNotes++;
        }
    }
    onclick(){}
    onmousemove(x,y){
        //convert mouse angle to this

        let angle = Math.atan2(y-this.parent.centerPos[1],x-this.parent.centerPos[0]);
       
        let exponent = (angle) / Math.PI /2 //now from -0.5 to 0.5

        this.frequency = 440 * 2**(exponent);
    }
}
