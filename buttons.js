

function playAllNotesInScale(fundamentalFreq){
    freqs = []
    if(fundamentalFreq === undefined){
        fundamentalFreq = scale.fundamentalFreq;
    }

    let fundamentalNoteData = null; //[noteObj, freq] of the fundamental freq, but one octave higher (to put at the end of the scale)

    //format: [Note, freq]
    for(var i=0;i<scale.objects.length;i++){
      if((scale.objects[i]).constructor === Note){
        
        let freq = scale.objects[i].frequency;
        let octavizedFreq = scale.octavize(scale.objects[i].frequency, fundamentalFreq);

        //put in the fundamental freq a second time, at the end of the scale
        if(freq == fundamentalFreq){
             fundamentalNoteData = [scale.objects[i], octavizedFreq*2];
        }
        freqs.push([scale.objects[i], octavizedFreq]);
      }
    }
    freqs.sort((a,b) => a[1]-b[1]); //sort numerically by frequency

    //constrain octave from going too high or too low
    while(freqs[0][1] > 700){
        freqs = freqs.map((o) => [o[0],o[1]/2]);
        fundamentalNoteData[1] /= 2
    }

    while(freqs[0][1] < 100){
        freqs = freqs.map((o) => [o[0],o[1]*2]);
        fundamentalNoteData[1] *= 2;
    }

    //now play all sounds
    freqs.forEach((data, i) => {
        let freq = data[1];
        let noteObj = data[0];
        let delay = i*0.5
        noteObj.synth.triggerAttackRelease(freq, 0.25, delay);
        window.setTimeout(function(){
            noteObj.changeColorDueToClick();
        }, delay*1000);
    });

    //play the fundamental frequency again, one octave up.
    //the way synths work, when they play a note they discard any note information afterwards.
    //this timeout is long enough that the first note should have stopped playing, and therefore won't discard it.
    let finalNoteDelay = (freqs.length) * 0.5;    
    window.setTimeout(function(){
        let noteObj = fundamentalNoteData[0];
        noteObj.changeColorDueToClick();
    }, finalNoteDelay);    
    window.setTimeout(function(){
        let freq = fundamentalNoteData[1];
        let noteObj = fundamentalNoteData[0];
        noteObj.synth.triggerAttackRelease(freq, 0.25, finalNoteDelay - 1);
    }, 1000);
}

function toggleEqualTemperamentLines(){
    let isShowing = !scale.showEqualTemperamentLines;
    scale.showEqualTemperamentLines = isShowing;
    if(isShowing){
        //show 'snap to equal temperament' button
        document.getElementById("equalTemperamentSnapButton").style.pointerEvents = "";
        document.getElementById("equalTemperamentSnapButton").style.opacity = "1"; 
    }
}

function quantizeToEqualTemperament(fundamentalFreq, freqToBeQuantized, numDivisions){
    
        let pitch = Math.log(freqToBeQuantized)/Math.log(2);
        let rootPitch = Math.log(fundamentalFreq)/Math.log(2)

        let quantizedPitch = Math.round((pitch-rootPitch)*numDivisions)/numDivisions+rootPitch;

        return Math.pow(2, quantizedPitch);
}

function snapNotesToEqualTemperament(){
    //format: [Note, freq]
    let numDivisions = scale.numOctaveDivisions;
    for(var i=0;i<scale.objects.length;i++){
      if((scale.objects[i]).constructor === Note){
        
        let freq = scale.objects[i].frequency;

        let quantizedFreq = quantizeToEqualTemperament(scale.fundamentalFreq, freq, numDivisions);

        scale.objects[i].frequency = quantizedFreq;
      }
    }
}

let scaleStarted = false;
function startScale(){
    if(scaleStarted)return;
    scaleStarted = true;

    scale.objects[0].confirmSelection();
    document.getElementById("scalestartBtn").style.opacity = "0";
    document.getElementById("scalestartBtn").style.pointerEvents = "none";

}

let settingsMenuVisible = false;
function toggleSettingsMenu(){
    settingsMenuVisible = !settingsMenuVisible;
    if(settingsMenuVisible){
        document.getElementById("settings").classList.add("settings-visible");
    }else{
        closeSettingsMenu();
    }
}
function closeSettingsMenu(){
        settingsMenuVisible = false;
        document.getElementById("settings").classList.remove("settings-visible");
}

function updateSlider(evt){
    //applied to all sliders. updates the next element after the slider to be the number value of the slider
    let elem = evt.target;
    let value = elem.value;
    elem.nextSibling.innerHTML = value;
}

function updateEqualTemperamentDivisions(event){
    event.preventDefault();
    let sliderElem = document.getElementById("equalTemperamentDivisionsSlider");
    scale.numOctaveDivisions = parseInt(sliderElem.value);
}

document.addEventListener('DOMContentLoaded', function(){
    let canvas = document.getElementById("canvas");
    canvas.addEventListener('click', closeSettingsMenu, false);
    canvas.addEventListener('touchstart', closeSettingsMenu, false);

    //work around iOS not starting audiocontext until user interaction is played
    document.addEventListener('touchstart', activateIOSSoundHack,false);
    document.addEventListener('touchend', activateIOSSoundHack,false);




    let sliders = document.getElementsByClassName("numericSlider");
    for(var i=0;i<sliders.length;i++){
        sliders[i].addEventListener('input', updateSlider,false);
    }

    document.getElementById('equalTemperamentDivisionsSlider').addEventListener('input' , updateEqualTemperamentDivisions,false);

}, false);
    
function activateIOSSoundHack(){
    scale.synth.triggerAttackRelease(0.1, 0.0001); //super low frequency synth note to start an audio context
    //only activate this once
    document.removeEventListener('touchstart',activateIOSSoundHack, false);
    document.removeEventListener('touchend',activateIOSSoundHack, false);
}
