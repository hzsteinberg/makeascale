let synth = null;

class MainSimulation{

    constructor(){
        this.fundamentalFreq = 440;

        this.objects = [new Note(this, this.fundamentalFreq), new NoteArrow(this, this.fundamentalFreq, "+", true),  new NoteArrow(this, this.fundamentalFreq, "+", false)]; //todo: click to place note


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

    freqToRenderPos(freq, rOffset=0){
    
        let r = Math.min(this.width, this.height) / 3;
        r += rOffset;

        let octaveNumber = Math.log(freq)/Math.log(2);

        let angle = (octaveNumber % 1)*Math.PI*2;

        let circlePos = [r*Math.cos(angle), r*Math.sin(angle)];

        let linearPos = 50+40*octaveNumber;

        return vecAdd(circlePos, this.centerPos);
    }

    onmousemove(){
        let x = event.x;
        let y = event.y;
        for(var i=0;i<this.objects.length;i++){
            this.objects[i].onmousemove(x,y);
            if(dist([x,y],this.objects[i].pos) < 20){
                //hover
                this.objects[i].onhover();
            }
        }

    }

    onmousedown(event){
        let x = event.x;
        let y = event.y;
        for(var i=0;i<this.objects.length;i++){
            if(dist([x,y],this.objects[i].pos) < 27){
                this.objects[i].clicked = true;
                this.objects[i].onclick();
            }
        }
    }

    onmouseup(event){
        let x = event.x;
        let y = event.y;

        for(var i=0;i<this.objects.length;i++){
           this.objects[i].clicked = false;
           this.objects[i].onmouseup(x,y);
        }
    }

    update(){
        let context = this.context;
        const t = Date.now() / 1000;
        const dt = Math.min(t-this.last_t, 1/15);
        this.last_t = t;


        for(var i=0;i<this.objects.length;i++){
            this.objects[i].update(1);
        }

        this.objects = this.objects.filter( (x)=>!x.isDead);

        //draw
        this.updateCanvasSize();
       // context.fillRect(0,0,this.width,this.height);

        //draw line
        context.beginPath();
        context.strokeStyle = "#222";
        context.lineWidth = 5;

        let startFreq = 440;
        context.moveTo(...this.freqToRenderPos(startFreq));
        for(var freq=startFreq;freq<=440*2.1;freq*=1.001){
            context.lineTo(...this.freqToRenderPos(freq));
        }
        context.stroke();

        for(var i=0;i<this.objects.length;i++){
            this.objects[i].draw(context);
        }
        window.requestAnimationFrame(this.update.bind(this));
    }
    makeANewTone(clickedFrequency, isIncreasing){

        //disappear and add a new tone

        let ratio = 1.5;

        let newFrequency = clickedFrequency * ratio;
        let midpointFrequency = clickedFrequency / Math.pow(ratio,1/3);
        if(isIncreasing){
            newFrequency = clickedFrequency / ratio;
             midpointFrequency = clickedFrequency * Math.pow(ratio, 1/3);
            
        }


        this.objects.push(new Note(this, newFrequency));

        /*
        this.objects.push(new NoteArrow(this, newFrequency, "+", true));
        this.objects.push(new NoteArrow(this, newFrequency, "+", false));
        */

        //only make one arrow, since the other one would just point back to yourself

        let numOctavesInEachDirection = 1.5;

        if(!isIncreasing){
             this.objects.push(new FadingText(this, clickedFrequency, "* 3/2!", -0.003));

             if(newFrequency < this.fundamentalFreq * (2**numOctavesInEachDirection)){
                this.objects.push(new NoteArrow(this, newFrequency, "+", false));
             }
        }else{
             this.objects.push(new FadingText(this, clickedFrequency, "* 2/3!", 0.003));
             if(newFrequency > this.fundamentalFreq / (2**numOctavesInEachDirection)){
                 this.objects.push(new NoteArrow(this, newFrequency, "+", true));
             }

        }
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
    onhover(){}
    update(dt){};

}



