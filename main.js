import * as THREE from './three.module.js';
import { PointerLockControls } from './PointerLockControls.js';


let  controls; 



const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 400);
camera.position.set(0, 0, 700);
camera.lookAt(scene.position);
scene.add(camera)


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(new THREE.Color(0xff0000));
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// comecar a modelagem do cenario
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
const Ground = new THREE.PlaneHelper(plane, 20, 0xaaaaaa);
scene.add(Ground);

//loading manager
const manager = new THREE.LoadingManager();

manager.onLoad = function() {
    console.log('Loading complete!');
};
manager.onProgress = function(url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};
manager.onError = function(url) {
    console.log('There was an error loading ' + url);
};
var loader  = new THREE.TextureLoader(manager);

// Load the texture
const texture = loader.load( "skytexture.jpg" );
const skyGeo = new THREE.SphereGeometry(700, 25, 25); 
const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    side: THREE
});
const sky = new THREE.Mesh(skyGeo, material);
    scene.add(sky);


// luzes
const spotLight = new THREE.SpotLight(0xffffff, 20000);
spotLight.castShadow = true;
spotLight.position.set(0, 150, 0);
//scene.add(spotLight);



// event listeners
document.addEventListener('keydown', onDocumentKeyDown, false);
controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', function () {
    controls.lock();
}, false);

function onDocumentKeyDown(event) {
    render();
    const key = event.key;
    const speed = 5;
    switch (key) {
        case "w":
            controls.moveForward(speed);
            break;
        case "a":
            controls.moveRight(-speed);
            break;
        case "s":
            controls.moveForward(-speed);
            break;
        case "d":
            controls.moveRight(speed);
            break;
    }

}

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


    

