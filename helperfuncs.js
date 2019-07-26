


function drawCircle(context, x,y,radius){
    context.beginPath();
    context.arc(x,y, radius, 0, 2 * Math.PI);
    context.fill();
}

function drawCircleStroke(context, x,y,radius){
    context.beginPath();
    context.arc(x,y, radius, 0, 2 * Math.PI);
    context.stroke();
}


function drawCenteredText(context, string, x,y){

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(string, x, y);

}

function vecAdd(a,b){
 return [a[0]+b[0],a[1]+b[1]];
}
function vecScale(a,t){
 return [a[0]*t,a[1]*t];
}

function lerp(a,b,t){
 return [a[0]*(1-t)+b[0]*(t),a[1]*(1-t)+b[1]*(t)];
}


function dist(a,b){
    let x = a[0]-b[0]
    let y = a[1]-b[1]

    return Math.sqrt(x*x+y*y);
}

function formatFreq(freq){
    return Math.floor(freq);
}



function drawTriangleInDirection(ctx, pos1, pos2){
  //pos1 is the back of the midline of the triangle, pos2 the tip

  let x1 = pos1[0], x2 = pos2[0],y1 = pos1[1],y2=pos2[1];
  
  const negativeTriangleDirectionVec = pos1.map((x,i) => 3/2*(pos1[i] - pos2[i]));

  const halfTriangleDirectionPerpVec1 = [-negativeTriangleDirectionVec[1]/2,negativeTriangleDirectionVec[0]/2];
  const halfTriangleDirectionPerpVec2 = [negativeTriangleDirectionVec[1]/2,-negativeTriangleDirectionVec[0]/2];
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(...vecAdd(vecAdd([x2,y2],negativeTriangleDirectionVec),halfTriangleDirectionPerpVec1));
  ctx.lineTo(...vecAdd(vecAdd([x2,y2],negativeTriangleDirectionVec),halfTriangleDirectionPerpVec2));
  ctx.lineTo(x2,y2);
  ctx.fill();

}



function beginSelectingScaleStart(fundamentalFreq){
    scale.objects.push(new ScaleStartNoteSelector(scale));
}

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
