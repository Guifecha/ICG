import * as THREE from './imports/js/three.module.js';
import { PointerLockControls } from './imports/js/PointerLockControls.js';
import { FBXLoader } from './imports/js/FBXLoader.js';

let model, controls;
let isJumping = false;
let keys = {};



document.addEventListener('keydown', function (event) {
    keys[event.code] = true;
}, false);

document.addEventListener('keyup', function (event) {
    keys[event.code] = false;
}, false);


function createScene() {
    const scene = new THREE.Scene();
    return scene;
}

function createCamera(scene) {
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 30000);
    camera.position.set(-900, 100, -900);
    camera.lookAt(scene.position);
    scene.add(camera);
    return camera;
}

function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}

function createGround(scene) {
    var groundTexture = new THREE.TextureLoader().load( 'imports/textures/floor.jpg' );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 100, 100 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    var groundMaterial = new THREE.MeshPhongMaterial( { map: groundTexture } );

    var groundGeometry = new THREE.PlaneGeometry( 10000, 10000 );

    var ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.receiveShadow = true; // Set the ground to receive shadows
    ground.rotation.x = - Math.PI / 2; // rotate it to lie flat
    ground.position.set(0,0,0)

    scene.add( ground );
}

function addlight(scene) {
    const light = new THREE.AmbientLight(0x404040, 0.2); // soft white light
    scene.add(light);

    const light2 = new THREE.DirectionalLight(0xffffff, 2);
    light2.position.set(5000, 8000, 5000);
    light2.castShadow = true;

    // Create an Object3D to serve as the target for the light
    const targetObject = new THREE.Object3D();
    targetObject.position.set(-900, 0, -900); // replace x, y, z with the coordinates you want the light to point to

    scene.add(targetObject); // add the target object to the scene

    light2.target = targetObject; // set the target of the light

    scene.add(light2);
}

function createSkybox(scene) {
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load( 'imports/textures/yonder_ft.jpg');
    let texture_bk = new THREE.TextureLoader().load( 'imports/textures/yonder_bk.jpg');
    let texture_up = new THREE.TextureLoader().load( 'imports/textures/yonder_up.jpg');
    let texture_dn = new THREE.TextureLoader().load( 'imports/textures/yonder_dn.jpg');
    let texture_rt = new THREE.TextureLoader().load( 'imports/textures/yonder_rt.jpg');
    let texture_lf = new THREE.TextureLoader().load( 'imports/textures/yonder_lf.jpg');
      
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

    for (let i = 0; i < 6; i++)
        materialArray[i].side = THREE.BackSide;
    let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
    let skybox = new THREE.Mesh( skyboxGeo, materialArray );
    scene.add( skybox );  
}

function createControls(camera, domElement) {
    controls = new PointerLockControls(camera, domElement);

    document.addEventListener('click', function () {
        controls.lock();
    }, false);
}



function loadModel(scene, camera, renderer) {
    const loader = new FBXLoader();
    loader.load('imports/models/Character_Soldier.fbx', function (object) {
        model = object;
        model.position.set(-900, 0, -900);

        // Set the camera's position relative to the model
        camera.position.set(0, 170, 0); // Adjust the y value to match the model's height

        model.add(camera); // Add the camera as a child of the model
        scene.add(model);
        animate(renderer, scene, camera);
        
    });
}


function animate(renderer, scene, camera) {
    const speed = 10; // Adjust the speed of movement
    let velocityY = 0;

    // Calculate the forward and right vectors of the camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    

    if (keys['KeyW']) {
        model.position.addScaledVector(forward, speed);
    }
    if (keys['KeyS']) {
        model.position.addScaledVector(forward, -speed);
    }
    if (keys['KeyA']) {
        model.position.addScaledVector(right, -speed);
    }
    if (keys['KeyD']) {
        model.position.addScaledVector(right, speed);
    }
    if (keys['Space'] && !isJumping) {
        isJumping = true;
        velocityY = 100; // Initial upward velocity
    }
    if (isJumping) {
        velocityY -= 3; // Gravity
        model.position.y += velocityY;

        // If model has landed
        if (model.position.y <= 0) {
            model.position.y = 0;
            velocityY = 0;
            isJumping = false;
        }   
    }
    renderer.render(scene, camera);
    requestAnimationFrame(() => animate(renderer, scene, camera));
}

// Execution
const scene = createScene();
const camera = createCamera(scene);
const renderer = createRenderer();
addlight(scene);
createGround(scene);
createSkybox(scene);
createControls(camera, renderer.domElement);
loadModel(scene, camera, renderer);
animate(renderer, scene, camera);