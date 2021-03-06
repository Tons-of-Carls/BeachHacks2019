var particleNum = 0;
var frameNum = 0;

var motionProfilList;

var vectorList = [];
var particleSelected;


var num = 1;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, 2, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff, 1);
renderer.setSize(1000, 500);
document.getElementById("canvas").appendChild(renderer.domElement);

var controls = new THREE.OrbitControls( camera, renderer.domElement );

var activeParticle;

camera.position.z = 5;



//x
var origin = new THREE.Vector3( -2, -2, -2 );
var dir = new THREE.Vector3( 1, 0, 0 );
var arrowHelper = new THREE.ArrowHelper( dir, origin, 1, 0xff0000 , .1, .1);
scene.add( arrowHelper );

//y
var origin = new THREE.Vector3(-2, -2, -2);
var dir = new THREE.Vector3( 0, 1, 0 );
var arrowHelper = new THREE.ArrowHelper( dir, origin, 1, 0x00ff00 , .1, .1);
scene.add( arrowHelper );

//z
var origin = new THREE.Vector3(-2, -2, -2);
var dir = new THREE.Vector3( 0, 0, 1  );
var arrowHelper = new THREE.ArrowHelper( dir, origin, 1, 0x0000ff , .1, .1);
scene.add( arrowHelper );




function addVector(origin_x,origin_y,origin_z,dir_x,dir_y,dir_z, length, color)
{
  var origin = new THREE.Vector3( origin_x, origin_y, origin_z );
  var dir = new THREE.Vector3( dir_x, dir_y, dir_z );
  dir.normalize();
  console.log(color);
  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, color , .1, .1);
  scene.add( arrowHelper );
  vectorList.push(arrowHelper);
}

function addParticle(x=-5,y=0,z=0) {
  var geometry = new THREE.SphereGeometry( .1 );
  var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  var sphere = new THREE.Mesh( geometry, material );
  scene.add( sphere );
  sphere.position.set(x,y,z);
  activeParticle = sphere;
}

function removeVectors() {
  for (var v in vectorList){
    scene.remove(vectorList[v]);
  }
}

function reAddVectors() {
  for (var v in vectorList){
    scene.add(vectorList[v]);
  }
}

function onShowVectorChange() {
  var val = document.getElementById("showVectors").checked;
  if(val){
    reAddVectors();
  }
  else{
    removeVectors();
  }
}

function onParticleSelect(particle){
  console.log(particle);
  particleSelected = particle;
  document.getElementById("dropdown").innerText = particleSelected;
}

function abs(num) {
  if(num < 0)
  {
    return -num;
  }
  return num;
}


function createVectorField() {
  for(var x = -num; x <= num; x++)
  {
    for(var y = -num; y <= num; y++)
    {
      for(var z = -num; z <= num; z++)
      {
        addVector(x,y,z,0,0,1,.5, ((y+num)/(2*num))*255*256*256 + 0*255*256 + (((y+num)/(-2*num))+num)*255);
      }
    }
  }
}

async function onSubmit () {
  var MFGradient = document.getElementById("MFGradient").value;
  var numSimulations = document.getElementById("simNum").value;
  var temperature = document.getElementById("Temperature").value;
  var dimension = document.getElementById("dimension").value;

  console.log(document.getElementById("dimension"));


  console.log(dimension);
  if(dimension !== "" && !document.getElementById("dimension").validity.badInput){
    num=parseInt(dimension);
    console.log("dim:");
    console.log(dimension);
    removeVectors();
    vectorList=[];
    createVectorField();
  }

  console.log(MFGradient);
  console.log(numSimulations);
  console.log(particleSelected);

  var data = {
    temperature: temperature,
    numSim: numSimulations,
    MFG: MFGradient,
    Particle: particleSelected,
    dim: 2*num,
  };

  var responce = await fetch(
    "http://localhost:8080/sternGerlachExperiment",
    {
      method:"POST",
      body:JSON.stringify(data)
    }
  );

  motionProfilList = await responce.json();

  addParticle(0,0,0);
}

function animate()
{
  requestAnimationFrame(animate);

  if( activeParticle && frameNum < motionProfilList[""+particleNum].length )
  {
    activeParticle.position.x = motionProfilList[""+particleNum][frameNum][0]-num;
    //console.log("x:", motionProfilList[""+particleNum][frameNum][0]);
    activeParticle.position.y = motionProfilList[""+particleNum][frameNum][1];
    //console.log("y:", motionProfilList[""+particleNum][frameNum][1]);
    activeParticle.position.z = motionProfilList[""+particleNum][frameNum][2];
    //console.log("z:", motionProfilList[""+particleNum][frameNum][2]);
    frameNum+=1;
  }
  else if(motionProfilList != null){
    frameNum = 0;
    particleNum+=1;
    if(particleNum < Object.keys(motionProfilList).length) {
      addParticle(0,0,0);
    }
    else {
      activeParticle = null;
      motionProfilList = null;
    }
  }

  renderer.render(scene,camera);
}



createVectorField();

animate();
