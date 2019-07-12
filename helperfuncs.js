


function drawCircle(context, x,y,radius){
    context.beginPath();
    context.arc(x,y, radius, 0, 2 * Math.PI);
    context.fill();
}

function drawCenteredText(context, string, x,y){

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(string, x, y);

}

function vecAdd(a,b){
 return [a[0]+b[0],a[1]+b[1]];
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
