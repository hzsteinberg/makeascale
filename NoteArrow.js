

class NoteArrow extends GameObject{
    constructor(parent, freq, text, isFacingRight = true){
        super();
        this.pos = [0,0];

        this.frequency = freq;

        this.freqOffset = 1.015; //controls how far away from true frequency this button displays at

        this.isFacingRight = isFacingRight


        this.arrowSize = 1.02; //controls direction of arrow. 
        if(this.isFacingRight === false){
            this.arrowSize = 1/this.arrowSize;
            this.freqOffset = 1/this.freqOffset;
        }


        this.displayAtFrequency = freq * this.freqOffset


        this.parent = parent;
        this.text = text;
        this.clickedOnce = false;

        this.size = 0;
        this.dSize = 3;
        this.maxSize = 20;


        this.creationDelayTimer = 0;
        this.creationDelay = 40;
    }
    draw(context){
        if(this.creationDelayTimer < this.creationDelay)return;



        this.pos = this.parent.freqToRenderPos(this.displayAtFrequency * this.freqOffset);

        let pos2 = this.parent.freqToRenderPos(this.displayAtFrequency * this.freqOffset *  this.arrowSize);

        //make the arrow go in that direction with a dist of 30
        let distance = dist(pos2, this.pos);
        let direction = this.pos.map((x,i) => (pos2[i] - this.pos[i])/distance * this.size);


        context.fillStyle = "white";
        if(this.clickedOnce)context.fillStyle = "#ffd";

        drawTriangleInDirection(context, this.pos, vecAdd(this.pos, direction));

        context.fillStyle = "black";
        context.font = "16" + "px calibri";
        drawCenteredText(context, this.text,  this.pos[0],this.pos[1]);
    }
    onclick(){
        if(!this.clickedOnce){
            this.clickedOnce = true;
            this.parent.makeANewTone(this.frequency, this.isFacingRight);
            this.deleteSelf();
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
