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

        // used to transition between linear frequency scale and radial frequency scales
        this.lerpFactor = 0;
        this.targetLerpFactor = 0;
        this.targetMode = "linear";
        this.currentMode = "linear";
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

        window.addEventListener("touchmove", this.ontouchmove.bind(this),{'passive':false});
        window.addEventListener("touchstart", this.ontouchstart.bind(this),{'passive':false});
        window.addEventListener("touchend", this.onmouseup.bind(this),{'passive':false});
        window.addEventListener("touchcancel", this.onmouseup.bind(this),{'passive':false});
    }

    updateCanvasSize(){
        //called every frame. also clears the canvas
        this.canvas.width = this.width = window.innerWidth;
        this.canvas.height = this.height = window.innerHeight;

        this.centerPos = [this.width/2, this.height/2];
    }

    freqToAngle(freq){
        if(this.currentMode == 'fifths')return this.fifthsFreqToAngle(freq);
        return this.radialFreqToAngle(freq);
    }

    radialFreqToAngle(freq){

        let octaveNumber = Math.log(freq)/Math.log(2);

        let referenceOctaveNumber = Math.log(440)/Math.log(2); //orient the angles so that 440 is on the right

        return ((octaveNumber - referenceOctaveNumber) % 1)*Math.PI*2;

    }

    fifthsFreqToAngle(freq){


        let freqToFifthsAngle = (freq) => {

            let octaveNumber = Math.log(freq)/Math.log(2);
            let referenceOctaveNumber = Math.log(440)/Math.log(2); //orient the angles so that 440 is on the right
            return ((octaveNumber - referenceOctaveNumber)/(7/12) * (Math.PI/6));
        }


        //now rotate the circle to ensure that this.fundamentalFreq has the same angle in radial and fifths mode
        let fundamentalFifthsAngle = freqToFifthsAngle(this.fundamentalFreq);
        let normalFundamentalAngle = this.radialFreqToAngle(this.fundamentalFreq);

        return (freqToFifthsAngle(freq) - fundamentalFifthsAngle + normalFundamentalAngle) % (Math.PI*2);

    }

    radialFreqToRenderPos(freq, rOffset = 0){
    
        let r = Math.min(this.width, this.height) / 3;
        r += rOffset;

        let octaveNumber = Math.log(freq)/Math.log(2);

        let angle = this.radialFreqToAngle(freq);

        return [r*Math.cos(angle), r*Math.sin(angle)];

    }


    fifthsFreqToRenderPos(freq, rOffset = 0){
    
        let r = Math.min(this.width, this.height) / 3;
        r += rOffset;

        let octaveNumber = Math.log(freq)/Math.log(2);

        let angle = this.fifthsFreqToAngle(freq);

        return [r*Math.cos(angle), r*Math.sin(angle)];

    }
    linearFreqToRenderPos(freq, rOffset = 0){

        //on a line instead of a circle. currently broken
        let numOctavesInLine = 2;
        let octaveNumber = Math.log(freq)/Math.log(2);
        let middlePitch = Math.log(880)/Math.log(2);
        let linearPos = ((octaveNumber-middlePitch) / numOctavesInLine * (this.width) );
        return [linearPos, rOffset];

    }

    freqToRenderPos(freq, rOffset=0){
        let linearPos = this.linearFreqToRenderPos(freq, rOffset);
        let radialPos = this.radialFreqToRenderPos(freq, rOffset);
        let fifthsPos = this.fifthsFreqToRenderPos(freq, rOffset);

        let positions = {"linear": linearPos, "radial": radialPos, "fifths": fifthsPos};

        
        let pos1 = positions[this.currentMode], pos2 = positions[this.targetMode];

        //animate transformations more smoothly
        let cosineInterpolationFactor = 0.5*(Math.cos((this.lerpFactor+1)*Math.PI)+1);

        let combinedPos = lerp(pos1, pos2, cosineInterpolationFactor);
        return vecAdd(combinedPos, this.centerPos);

    }


    ontouchmove(event){
        event.preventDefault();

        let rect = this.canvas.getBoundingClientRect();
        
        for(var i=0;i<event.touches.length;i++){
            let touch = event.touches[i];
            this.onmousemove({x: touch.clientX - rect.left, y: touch.clientY- rect.top});
        }

    }

    onmousemove(event){
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

    ontouchstart(event){
        if(event.target == this.canvas)event.preventDefault();

        let rect = this.canvas.getBoundingClientRect();

        for(var i=0;i<event.touches.length;i++){
            let touch = event.touches[i];
            this.onmousedown({x: touch.clientX - rect.left, y: touch.clientY- rect.top});
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
        if(this.currentMode == "linear"){
            this.changeModeTo("radial");
            document.getElementById("displayModeBtn").innerHTML = "View: Octave";
        }else if(this.currentMode == "radial"){
            this.changeModeTo("fifths");
            document.getElementById("displayModeBtn").innerHTML = "View: Ratios";
        }else{
            this.changeModeTo("linear");
            document.getElementById("displayModeBtn").innerHTML = "View: Frequency";
        }
    }

    changeModeTo(mode){
        if(this.currentMode == mode)return;

        this.targetMode = mode;

        if(this.lerpFactor == 1){
            // don't interrupt an existing animation
            this.lerpFactor = 0;
        }
        this.targetLerpFactor = 1;
    }

    update(){
        let context = this.context;
        const t = Date.now() / 1000;
        const dt = Math.min(t-this.last_t, 1/15);
        this.last_t = t;


        //if transitioning between modes, update
        if(Math.abs(this.lerpFactor - this.targetLerpFactor) > 0.05){
            this.lerpFactor += 1 * Math.sign(this.targetLerpFactor-this.lerpFactor) * dt;
        }else{
            this.lerpFactor = this.targetLerpFactor; 
            this.currentMode = this.targetMode;
        }


        for(var i=0;i<this.objects.length;i++){
            this.objects[i].update(1);
        }

        this.objects = this.objects.filter( (x)=>!x.isDead);

        //draw
        this.updateCanvasSize();
       // context.fillRect(0,0,this.width,this.height);

        //draw the line/circle along which all notes lie
        context.beginPath();
        context.strokeStyle = "#222";
        context.lineWidth = 5;
        
        let numOctavesToDraw = 1;
        if(this.currentMode == 'linear'){
            numOctavesToDraw = 3;
        }
        if(this.currentMode == 'fifths' || this.targetMode == 'fifths'){
            numOctavesToDraw = 6;
        }


        let startFreq = 440/2;
        context.moveTo(...this.freqToRenderPos(startFreq/(2**numOctavesToDraw)));
        for(let freq=startFreq/(2**numOctavesToDraw);freq<=startFreq*2.1*(2**numOctavesToDraw);freq*=1.001){
            context.lineTo(...this.freqToRenderPos(freq));
        }
        context.stroke();


        //draw evenly spaced equal temperament ticks
        context.lineWidth = 3;
        if(this.showEqualTemperamentLines){

            let distanceBetweenTicks = 1/12;
            if(this.currentMode == "fifths" || this.targetMode == "fifths"){
                distanceBetweenTicks = 7/12;
            }


            for(let exponent=0;exponent <= 4; exponent += distanceBetweenTicks){
                //positive direction
                context.beginPath();
                let freq = this.fundamentalFreq * 2**(exponent);
                context.moveTo(...this.freqToRenderPos(freq,60));
                context.lineTo(...this.freqToRenderPos(freq,-60));
                context.stroke();

                //negative direction
                context.beginPath();
                freq = this.fundamentalFreq * 2**(-exponent);
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
    makeANewTone(clickedFrequency, isIncreasing, displayTextAtFrequency){

        if(displayTextAtFrequency === undefined){
            displayTextAtFrequency = clickedFrequency;
        }

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
             this.objects.push(new FadingText(this, displayTextAtFrequency, "* 2/3!", -0.006));

             if(newFrequency < this.fundamentalFreq * this.highestAllowedInterval){
                this.objects.push(new FifthsNoteArrow(this, clickedFrequency,false));
                this.objects.push(new NoteArrow(this, newFrequency, "+", false));
             }
        }else{
             this.objects.push(new FadingText(this, displayTextAtFrequency, "* 3/2!", 0.006));
             if(newFrequency > this.fundamentalFreq / this.highestAllowedInterval){
                this.objects.push(new FifthsNoteArrow(this, clickedFrequency,true));
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



