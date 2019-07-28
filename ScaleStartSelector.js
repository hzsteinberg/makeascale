
class ScaleStartNoteSelector extends Note{
    constructor(parent){
        super(parent, 440);
        this.creationDelay = 1;

        this.mouseAngle = 0;

        this.selectedNote = null;
        this.calcSelectedNote();
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
            if(this.selectedNote === null)return;

            this.clickedOnce = true;
            this.targetRadius = -1;

            playAllNotesInScale(this.selectedNote.frequency);
        }
    }
    onclick(){}

    calcSelectedNoteRadially(){
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
        if(minAngle == 999)return;

        this.selectedNote = this.parent.objects[selectedIndex];
        
    }
    angleDiff(a,b){
        const pi2 = Math.PI*2;
        const dist = Math.abs(a-b)%pi2
        return dist > Math.PI ? (pi2-dist) : dist
    }
    onmousemove(x,y){
        //convert mouse angle to this
        if(this.parent.currentMode == "radial" || this.parent.currentMode == "fifths"){
            this.mouseAngle = Math.atan2(y-this.parent.centerPos[1],x-this.parent.centerPos[0]);
            this.calcSelectedNote();
        }else{
                //need to calculate...
        }
    }
}












class MultiNoteSelector extends Note{
    constructor(parent){
        super(parent, 440);
        this.creationDelay = 1;

        this.mouseAngle = 0;

        this.selectedNotes = [];
        this.calcSelectedNote();
    }
    draw(context){
        if(!this.hasAnnouncedOwnPresence)return;

        for(var i=0;i<this.selectedNotes.length;i++){
            let note = this.selectedNotes[i]
            let pos = this.parent.freqToRenderPos(note.frequency);

            //the circle
            let angle = this.parent.freqToAngle(note.frequency);
            //let hueVal = (angle/Math.PI/2 + 0.5)*360;
            //context.fillStyle = "hsl("+hueVal+",50%,50%)";

            context.strokeStyle = "black"
            drawCircleStroke(context, pos[0],pos[1],this.currentRadius * 2);
        }
    }
    onmousedown(x,y){
        if(!this.clickedOnce){
            this.clickedOnce = true;
            this.targetRadius = -1;

            playAllNotesInScale(this.selectedNote.frequency);
        }
    }
    onclick(){}

    calcSelectedNoteRadially(){
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

        let obj = this.parent.objects[selectedIndex];
        if(this.selectedNotes.indexOf(obj) !== -1){
            //remove obj from this.selectedNotes
            this.selectedNotes.splice(this.selectedNotes.indexOf(obj),1);
        }else{
            this.selectedNotes.push(obj)
        }

        
    }
    angleDiff(a,b){
        const pi2 = Math.PI*2;
        const dist = Math.abs(a-b)%pi2
        return dist > Math.PI ? (pi2-dist) : dist
    }
    onmousedown(x,y){
        //convert mouse angle to this
       if(this.parent.currentMode == "radial" || this.parent.currentMode == "fifths"){
            this.mouseAngle = Math.atan2(y-this.parent.centerPos[1],x-this.parent.centerPos[0]);
            this.calcSelectedNoteRadially();
        }else{
            //need to calculate...
        }
    }
}
