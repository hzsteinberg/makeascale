let synth = null;

class MainSimulation{

    constructor(){
        this.fundamentalFreq = 812;

        this.objects = [new FirstNote(this)]; //todo: click to place note


        this.synth = new Tone.PolySynth(16, Tone.Synth, {
          oscillator: {
            type: "sine",
            volume: -20
          },
          envelope: {
            attack: 0.05,
            decay: 0,
            sustain: 1,
            release: 1.2
          }
        }).toMaster()

        this.showEqualTemperamentLines = false;
        this.highestAllowedInterval = 1.5**30;

        this.numNotes = 0;

        // used to transition between linear frequency scale and radial frequency scale
        this.lerpFactor = 0;
        this.targetLerpFactor = 0;
        this.mode = "linear" //or 'radial';
        this.targetMode = "";
    }

    start(){

        this.canvas = document.getElementById("canvas");
        this.context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height= canvas.height;
        this.last_t = Date.now() / 1000;

        this.centerPos = [this.width/2, this.height/2];

        this.update();

        window.addEventListener("mousemove", this.onmousemove.bind(this));
        window.addEventListener("mousedown", this.onmousedown.bind(this));
        window.addEventListener("mouseup", this.onmouseup.bind(this));
    }

    updateCanvasSize(){
        //called every frame. also clears the canvas
        this.canvas.width = this.width = window.innerWidth;
        this.canvas.height = this.height = window.innerHeight;

        this.centerPos = [this.width/2, this.height/2];
    }

    freqToAngle(freq){

        let octaveNumber = Math.log(freq)/Math.log(2);

        let referenceOctaveNumber = Math.log(440)/Math.log(2); //orient the angles so that 440 is on the right

        return ((octaveNumber - referenceOctaveNumber) % 1)*Math.PI*2;

    }

    radialFreqToRenderPos(freq, rOffset = 0){
    
        let r = Math.min(this.width, this.height) / 3;
        r += rOffset;

        let octaveNumber = Math.log(freq)/Math.log(2);

        let angle = this.freqToAngle(freq);

        return [r*Math.cos(angle), r*Math.sin(angle)];

    }
    linearFreqToRenderPos(freq, rOffset = 0){

        //on a line instead of a circle. currently broken
        let numOctavesInLine = 2;
        let octaveNumber = Math.log(freq)/Math.log(2);
        let middlePitch = Math.log(this.fundamentalFreq)/Math.log(2);
        let linearPos = ((octaveNumber-middlePitch) / numOctavesInLine * (this.width) );
        return [linearPos, rOffset];

    }

    freqToRenderPos(freq, rOffset=0){
        let linearPos = this.linearFreqToRenderPos(freq, rOffset);
        let radialPos = this.radialFreqToRenderPos(freq, rOffset);

       // return vecAdd(linearPos, this.centerPos);
        //return vecAdd(radialPos, this.centerPos);

        //animate transformations more smoothly
        let cosineInterpolationFactor = 0.5*(Math.cos((this.lerpFactor+1)*Math.PI)+1);

        let combinedPos = lerp(linearPos, radialPos, cosineInterpolationFactor);
        return vecAdd(combinedPos, this.centerPos);

    }

    onmousemove(){
        let x = event.x;
        let y = event.y;
        for(var i=0;i<this.objects.length;i++){
            this.objects[i].onmousemove(x,y);
            if(dist([x,y],this.objects[i].pos) < 30){
                //hover
                this.objects[i].onhover();
            }
        }

    }

    onmousedown(event){
        let x = event.x;
        let y = event.y;
        for(var i=0;i<this.objects.length;i++){
            this.objects[i].onmousedown(x,y);
            if(dist([x,y],this.objects[i].pos) < 30){
                this.objects[i].clicked = true;
                this.objects[i].onclick();
            }
        }
    }

    onmouseup(event){
        let x = event.x;
        let y = event.y;

        for(var i=0;i<this.objects.length;i++){
           this.objects[i].onmouseup(x,y);
           this.objects[i].clicked = false;
        }
    }

    cycleMode(){
        if(this.mode == "linear"){
            this.changeModeTo("radial");
        }else{
            this.changeModeTo("linear");
        }
    }

    changeModeTo(mode){
        if(this.mode == mode)return;

        this.targetMode = mode;

        if(mode == "linear"){
            this.mode = "linear";
            this.targetLerpFactor = 0;
        }else if(mode == "radial"){
            this.targetLerpFactor = 1;
        }
    }

    update(){
        let context = this.context;
        const t = Date.now() / 1000;
        const dt = Math.min(t-this.last_t, 1/15);
        this.last_t = t;


        if(Math.abs(this.lerpFactor - this.targetLerpFactor) > 0.01){
            this.lerpFactor += 1 * Math.sign(this.targetLerpFactor-this.lerpFactor) * dt;

        }else{
            this.lerpFactor = this.targetLerpFactor;
            if(this.targetLerpFactor == 1){
                this.mode = "radial"
            }else{
                this.mode = "linear";
            }
        }


        for(var i=0;i<this.objects.length;i++){
            this.objects[i].update(1);
        }

        this.objects = this.objects.filter( (x)=>!x.isDead);

        //draw
        this.updateCanvasSize();
       // context.fillRect(0,0,this.width,this.height);

        //draw circle
        context.beginPath();
        context.strokeStyle = "#222";
        context.lineWidth = 5;


        
        if(this.mode == 'radial'){
            //render one circle
            let startFreq = 440;
            context.moveTo(...this.freqToRenderPos(startFreq));
            for(let freq=startFreq;freq<=440*2.1 * 4;freq*=1.001){
                context.lineTo(...this.freqToRenderPos(freq));
            }
            context.stroke();
        }else{
            let startFreq = 440/2;
            let numOctaves = 3;
            context.moveTo(...this.freqToRenderPos(startFreq/(2**numOctaves)));
            for(let freq=startFreq/(2**numOctaves);freq<=startFreq*2.1*(2**numOctaves);freq*=1.001){
                context.lineTo(...this.freqToRenderPos(freq));
            }
            context.stroke();
        }


        //draw evenly spaced equal temperament ticks
        context.lineWidth = 3;
        if(this.showEqualTemperamentLines){
            for(let exponent=-3;exponent <= 3; exponent += 1/12){

                context.beginPath();
                let freq = this.fundamentalFreq * 2**(exponent);
                
                context.moveTo(...this.freqToRenderPos(freq,60));
                context.lineTo(...this.freqToRenderPos(freq,-60));

                context.stroke();
            }
        }


        for(var i=0;i<this.objects.length;i++){
            this.objects[i].draw(context);
        }
        window.requestAnimationFrame(this.update.bind(this));
    }
    makeANewTone(clickedFrequency, isIncreasing){

        //disappear and add a new tone

        let ratio = 1.5;

        let newFrequency = clickedFrequency / ratio;
        let midpointFrequency = clickedFrequency / Math.pow(ratio,1/3);
        if(isIncreasing){
            newFrequency = clickedFrequency * ratio;
            midpointFrequency = clickedFrequency * Math.pow(ratio, 1/3);
        }


        this.objects.push(new Note(this, newFrequency));

        /*
        this.objects.push(new NoteArrow(this, newFrequency, "+", true));
        this.objects.push(new NoteArrow(this, newFrequency, "+", false));
        */

        //only make one arrow, since the other one would just point back to yourself

        if(!isIncreasing){
             this.objects.push(new FadingText(this, clickedFrequency, "* 2/3!", -0.006));

             if(newFrequency < this.fundamentalFreq * this.highestAllowedInterval){
                this.objects.push(new NoteArrow(this, newFrequency, "+", false));
             }
        }else{
             this.objects.push(new FadingText(this, clickedFrequency, "* 3/2!", 0.006));
             if(newFrequency > this.fundamentalFreq / this.highestAllowedInterval){
                 this.objects.push(new NoteArrow(this, newFrequency, "+", true));
             }
        }
        this.numNotes ++;

        //show the 'play scale' button once it arises
        if(this.numNotes > 3){
            let playScaleBtn = document.getElementById("playScaleBtn");
            playScaleBtn.style.opacity = 1;
            playScaleBtn.style.pointerEvents = ''; //cancels out the 'none'
        }
    }


    mainOctavize(x){
        return this.octavize(x, this.fundamentalFreq);
    }
    octavize(x, fundamentalFreq){
        //fundamentalFreq is deliberately NOT multiplied by 2 here.
        while(x >= fundamentalFreq*2-1){
            x /= 2;
        }
        while(x < fundamentalFreq-1){
            x *= 2;
        }
        return x;
    }
}


class GameObject{

    constructor(){

        this.pos = [-50,-50];
        this.clicked = false;
        this.isDead = false;
    }
    
    onclick(){}
    onmouseup(x,y){}
    onmousemove(x,y){}
    onmousedown(x,y){}
    onhover(){}
    update(dt){};

}



