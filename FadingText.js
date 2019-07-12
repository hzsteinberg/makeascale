class FadingText extends GameObject{
    constructor(parent, freq, text, dFreq=0){
        super();
        this.pos = [0,0];

        this.frequency = freq;

        this.dFreq = dFreq;

        this.parent = parent;
        this.text = text;

        this.bonusR = 10;
        this.dBonusR = 1;
  

        this.aliveTimer = 0;
        this.aliveTime = 200;

        this.speed = 2;
    }
    draw(context){

        this.pos = this.parent.freqToRenderPos(this.frequency, this.bonusR);


        let colorPercentage = 1-(this.aliveTimer / this.aliveTime)**2;

        context.fillStyle = "hsla(0,0%,0%, "+colorPercentage+")";
        //context.fillStyle = "black";
        context.font = "32" + "px bold calibri";
        drawCenteredText(context, this.text,  this.pos[0],this.pos[1]);
    }
    update(dt){

        this.frequency *= (1+(this.dFreq * dt));

        //slow down angular velocity towards end
        if(this.aliveTimer > this.aliveTime/3){
            this.dFreq = this.dFreq - this.dFreq/7*dt;
            this.dBonusR -= this.dBonusR *dt;
        }else{
            this.dFreq += Math.sign(this.dFreq)*0.0002 * dt; //acceleration
        }


        this.bonusR += this.dBonusR * 2 * dt;

        this.aliveTimer += this.speed* dt;
        if(this.aliveTimer > this.aliveTime){
            this.isDead = true;
        }
    }
}
