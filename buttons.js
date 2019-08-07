

function playAllNotesInScale(fundamentalFreq){
    freqs = []
    if(fundamentalFreq === undefined){
        fundamentalFreq = scale.fundamentalFreq;
    }

    //format: [Note, freq]
    for(var i=0;i<scale.objects.length;i++){
      if((scale.objects[i]).constructor === Note){
        
        let freq = scale.objects[i].frequency;
        let octavizedFreq = scale.octavize(scale.objects[i].frequency, fundamentalFreq);

        //put in the fundamental freq a second time, at the end of the scale
        if(freq == fundamentalFreq){
             freqs.push([scale.objects[i], octavizedFreq*2]);
        }
        freqs.push([scale.objects[i], octavizedFreq]);
      }
    }
    freqs.sort((a,b) => a[1]-b[1]); //sort numerically by frequency

    //constrain octave from going too high or too low
    while(freqs[0][1] > 700){
        freqs = freqs.map((o) => [o[0],o[1]/2]);
    }

    while(freqs[0][1] < 100){
        freqs = freqs.map((o) => [o[0],o[1]*2]);
    }

    //now play all sounds
    freqs.forEach((data, i) => {
        let freq = data[1];
        let noteObj = data[0];
        let delay = i*0.5
        scale.synth.triggerAttackRelease(freq, 0.25, "+" + delay)
        window.setTimeout(function(){
            noteObj.changeColorDueToClick();
        }, delay*1000);
    })
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

function snapNotesToEqualTemperament(){
    //format: [Note, freq]
    let numDivisions = 12;
    for(var i=0;i<scale.objects.length;i++){
      if((scale.objects[i]).constructor === Note){
        
        let pitch = Math.log(scale.objects[i].frequency)/Math.log(2);
        let rootPitch = Math.log(scale.fundamentalFreq)/Math.log(2)

        let quantizedPitch = Math.round((pitch-rootPitch)*numDivisions)/numDivisions+rootPitch;

        let quantizedFreq = Math.pow(2, quantizedPitch);
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

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById("canvas").addEventListener('click', closeSettingsMenu, false);
    document.getElementById("canvas").addEventListener('touchstart', closeSettingsMenu, false);
}, false);
    
