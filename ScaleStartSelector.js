
class ScaleStartNoteSelector extends Note{
    constructor(parent){
        super(parent, 440);
        this.creationDelay = 1;

        this.mouseAngle = 0;

        this.selectedNote = null;
    }
    draw(context){
        if(!this.hasAnnouncedOwnPresence)return;

        if(this.selectedNote === null)return;


        this.pos = this.parent.freqToRenderPos(this.selectedNote.frequency);

        //the circle
        let angle = this.parent.freqToAngle(this.selectedNote.frequency);
        //let hueVal = (angle/Math.PI/2 + 0.5)*360;
        //context.fillStyle = "hsl("+hueVal+",50%,50%)";

        context.strokeStyle = "black"
        drawCircleStroke(context, this.pos[0],this.pos[1],this.currentRadius * 2);

        context.fillStyle = "rgba(0,0,0,"+((this.currentRadius)/this.defaultRadius)+")";
        context.font = "20" + "px calibri";
        drawCenteredText(context, "Start playing from here?",  ...this.parent.freqToRenderPos(this.selectedNote.frequency, -200));
    }
    onmousedown(x,y){
        if(!this.clickedOnce){
            this.clickedOnce = true;
            this.targetRadius = -1;

            playAllNotesInScale(this.selectedNote.frequency);
        }
    }
    onclick(){}

    calcSelectedNote(){
        let angles = [];
        let minAngle = 999;
        let selectedIndex = 0;
        for(var i=0;i<this.parent.objects.length;i++){
          if((this.parent.objects[i]).constructor === Note){            
            let freq = scale.objects[i].frequency;
            let angle = this.parent.freqToAngle(freq);

            const angleDist = this.angleDiff(angle, this.mouseAngle)
            if(angleDist < minAngle){
                minAngle = angleDist;
                selectedIndex = i;
            }
          }
        }
        this.selectedNote = this.parent.objects[selectedIndex];
        
    }
    angleDiff(a,b){
        const pi2 = Math.PI*2;
        const dist = Math.abs(a-b)%pi2
        return dist > Math.PI ? (pi2-dist) : dist
    }
    onmousemove(x,y){
        //convert mouse angle to this
        this.mouseAngle = Math.atan2(y-this.parent.centerPos[1],x-this.parent.centerPos[0]);
        this.calcSelectedNote();
    }
}
