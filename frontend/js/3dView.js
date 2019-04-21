var particleNum = 0;
var frameNum = 0;

var motionProfilList;

var vectorList = [];
var particleSelected;


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, 2, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff, 1);
renderer.setSize(1000, 500);
document.getElementById("canvas").appendChild(renderer.domElement);

var controls = new THREE.OrbitControls( camera, renderer.domElement );

var activeParticle;

camera.position.z = 5;

function animate()
{
  requestAnimationFrame(animate);

  if( activeParticle && activeParticle.position.x < 5 )
  {
    activeParticle.position.x += .1
    frameNum+=1;
  }
  else{
    frameNum = 0;
    particleNum+=1;
    addParticle()
  }

  renderer.render(scene,camera);
}

function addVector(origin_x,origin_y,origin_z,dir_x,dir_y,dir_z, length, color)
{
  var origin = new THREE.Vector3( origin_x, origin_y, origin_z );
  var dir = new THREE.Vector3( dir_x, dir_y, dir_z );
  dir.normalize();

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

function onSubmit() {
  var MFGradient = document.getElementById("MFGradient").value;
  var numSimulations = document.getElementById("simNum").value;
  var temperature = document.getElementById("Temperature").value;

  console.log(MFGradient);
  console.log(numSimulations);
  console.log(particleSelected);

  var data = {
    temperature: temperature,
    numSim: numSimulations,
    MFG: MFGradient,
    Particle: particleSelected
  }

  fetch(
    "http://localhost:8080/sterm_gerlach_experiment",
    {
      method:"POST",
      body:JSON.stringify(data)
    }
  ).then(res=>{
    res.json()
  }).then((json)=>{
    console.log(json);
  });
}

function animate()
{
  requestAnimationFrame(animate);

  if( activeParticle && activeParticle.position.x < 4 )
  {
    activeParticle.position.x += .1
    frameNum+=1;
  }
  else if(particleNum < 1){
    frameNum = 0;
    particleNum+=1;
    addParticle(-5,0.6,2.3)
  }

  renderer.render(scene,camera);
}

var num = 3;

for(var x = -num; x <= num; x++)
{
  for(var y = -num; y <= num; y++)
  {
    for(var z = -num; z <= num; z++)
    {
      addVector(x,y,z,0,1,0,.5, ((y+num)/(2*num))*255*256*256 + 0*255*256 + (((y+num)/(-2*num))+num)*255);
    }
  }
}

addParticle();

animate();
