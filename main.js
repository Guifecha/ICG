import * as THREE from './imports/js/three.module.js';
import { PointerLockControls } from './imports/js/PointerLockControls.js';
import { FBXLoader } from './imports/js/FBXLoader.js';

let model,model2, controls, mixer,moveAction,idleAction;
const clock = new THREE.Clock();
let isJumping = false;
let keys = {};
let isRedLight = true;
let targetRotation = 90 
let isTurningBack = false;
let gameOver = false;
let isMoving = false;

document.addEventListener('keydown', function (event) {
    keys[event.code] = true;
}, false);

document.addEventListener('keyup', function (event) {
    keys[event.code] = false;
}, false);


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 30000);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function createGround(scene) {
    var groundTexture = new THREE.TextureLoader().load( 'imports/textures/floor2.jpg' );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 100, 100 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    var groundMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, map: groundTexture});

    var groundGeometry = new THREE.PlaneGeometry( 20000, 20000 );

    var ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.receiveShadow = true; // Set the ground to receive shadows
    ground.rotation.x = - Math.PI / 2; // rotate it to lie flat
    ground.position.set(0,0,-6000)

    scene.add( ground );
}

function addlight(scene) {
    const light2 = new THREE.DirectionalLight(0xffffff, 2);
    light2.position.set(2000, 4000, -10000);
    // Create an Object3D to serve as the target for the light
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, -5000); // replace x, y, z with the coordinates you want the light to point to

    scene.add(targetObject); // add the target object to the scene

    light2.target = targetObject; // set the target of the light


    scene.add(light2);
    light2.castShadow = true;
    light2.shadow.mapSize.width = 8192; // default
    light2.shadow.mapSize.height = 8192; // default
    light2.shadow.camera.near = 10; // default
    light2.shadow.camera.far = 30000; // default
    light2.shadow.camera.left = 5000;
    light2.shadow.camera.right = -5000;
    light2.shadow.camera.top = 5000;
    light2.shadow.camera.bottom = -5000;
    
    
}

function createFinishLine(scene) {
    const finishLineTexture = new THREE.TextureLoader().load('imports/textures/finish.png'); // Replace with the path to your finish line texture
    const finishLineMaterial = new THREE.MeshBasicMaterial({ map: finishLineTexture });
    const finishLineGeometry = new THREE.BoxGeometry(20000, 10, 300); // Adjust these values to change the size of the finish line

    const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.position.set(0, 0, -1000); // Adjust these values to change the position of the finish line

    scene.add(finishLine);
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
    let skyboxGeo = new THREE.BoxGeometry( 20000, 10500, 20000);
    let skybox = new THREE.Mesh( skyboxGeo, materialArray );
    skybox.position.set(0,4750,-6000)
    scene.add( skybox );  
}

function createTree(cylinderHeight, cylinderRadius, coneHeight, baseConeRadius, positionx, positionz) {
    const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 32);
    const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const cylinder = new THREE.Mesh(cylinderGeometry, redMaterial);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.y = cylinderHeight / 2.0;
    const coneGeometry = new THREE.ConeGeometry(baseConeRadius, coneHeight, 32);
    const greenMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cone = new THREE.Mesh(coneGeometry, greenMaterial);
    cone.castShadow = true;
    cone.receiveShadow = true;
    cone.position.y = cylinderHeight + coneHeight / 2.0;
    const tree = new THREE.Group();
    tree.add(cylinder);
    tree.add(cone);
    tree.position.x = positionx;
    tree.position.z = positionz;

    return tree;
}

const forest = new THREE.Group();
function createForest(scene, xpos, zpos) {
    
    const tree1 = createTree(1000, 100, 300, 400, xpos-1000, zpos-1000);
    forest.add(tree1);
    const tree2 = createTree(500, 100, 200, 700, xpos+1050, zpos+1040);
    forest.add(tree2);
    const tree3 = createTree(130, 100, 200, 90, xpos+3200, zpos+3100);
    forest.add(tree3);
    const tree4 = createTree(1300, 100, 100, 120, xpos-3400, zpos-340);
    forest.add(tree4);
    const tree5 = createTree(250, 103, 300, 400, xpos-540, zpos-700);
    forest.add(tree5);
    const tree6 = createTree(725, 85, 500, 320, xpos+910, zpos+310);
    forest.add(tree6);
    const tree7 = createTree(386, 30, 400, 120, xpos+1200, zpos-1200);
    forest.add(tree7);
    const tree8 = createTree(100, 70, 200, 420, xpos-500, zpos+300);
    forest.add(tree8);
    scene.add(forest);
}

function createControls(camera, domElement) {
    controls = new PointerLockControls(camera, domElement);

    document.addEventListener('click', function () {
        controls.lock();
    }, false);
}



function loadModel(scene, camera, renderer) {
    const loader = new FBXLoader();
    loader.load('imports/models/Beach.fbx', function (object) {
        model = object;
        
        model.position.set(0, 0, -12000);
        camera.position.set(0, 170, 0); // Adjust the y value to match the model's height

        if (model.animations && model.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            moveAction = mixer.clipAction(model.animations[1]); // runnning animation
            idleAction = mixer.clipAction(model.animations[20]); // idle animation
            
        }
        model.add(camera);
        scene.add(model);
        model.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        animate(renderer, scene, camera);

    });
}



function checkBoundaries(object, minX, maxX, minZ, maxZ) {
    if (object.x < minX) {
        object.x = minX;
    } else if (object.x > maxX) {
        object.x = maxX;
    }

    if (object.z < minZ) {
        object.z = minZ;
    } else if (object.z > maxZ) {
        object.z = maxZ;
    }
}

function loadModel2() {
    const loader = new FBXLoader();
    loader.load('imports/models/charpolice.fbx', function (object) {
        model2 = object;
        model2.position.set(0, 0, -1000);

        const startingRotation = 90 * (Math.PI / 180); // Adjust this value to set the starting rotation (in radians)
        model2.rotation.y = startingRotation;

        const scaleFactor = 10; // Adjust this value to scale the model
        model2.scale.set(scaleFactor, scaleFactor, scaleFactor);
        

        scene.add(model2);
        model2.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        toggleLight();
    });
}

function toggleLight() {
    if (!model2) return;

    if (isRedLight) {
        isRedLight = false;
        isTurningBack = true;
        targetRotation = 2 * Math.PI; 
    } else {
        targetRotation = Math.PI;
        // Add a delay before setting isRedLight to true
        setTimeout(() => {
            isRedLight = true;
        }, 500); // Adjust this value to change the delay
    }

    let time = isRedLight ? 3000 : Math.random() * (10000 - 2000) + 2000; 
    setTimeout(toggleLight, time);
}

/*document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (isRedLight && document.pointerLockElement &&(key === "w" || key === "a" || key === "s" || key === "d")) {
        showLoseScreen();
    }
}, false);

document.addEventListener('mousemove', function(event) {
    if (isRedLight && document.pointerLockElement) {
        showLoseScreen();
    }
}, false);*/


window.addEventListener('keydown', function(event) {
    if (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd') {
        isMoving = true;
    }
});

window.addEventListener('keyup', function(event) {
    if (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd') {
        isMoving = false;
    }
});


function showLoseScreen() {
    if (gameOver) return;
    gameOver = true;
    const messageDiv = document.getElementById('Screen');
    console.log("You lose!")
    messageDiv.textContent = "You lose!";
    messageDiv.style.display = "block";
    const rematchButton = document.getElementById('rematchButton');
    rematchButton.addEventListener('click', function() {
        window.location.reload();
    });
}

function showWinScreen() {
    if (gameOver) return;
    gameOver = true;
    console.log("You win!")
    const messageDiv = document.getElementById('Screen');
    messageDiv.textContent = "You win!";
    messageDiv.style.display = "block";
    const rematchButton = document.getElementById('rematchButton');
    rematchButton.addEventListener('click', function() {
        window.location.reload();
    });
}

function checkCollision(model, forest) {
    for (let i = 0; i < forest.length; i++) {
        let tree = forest[i];
        let distance = model.position.distanceTo(tree.position);

        if (distance < (model.size / 2 + tree.size / 2)) {
            return true;
        }
    }
    return false;
}

function animate(renderer, scene, camera) {
    const speed = 100; // Adjust the speed of movement
    let velocityY = 0;
    
    checkBoundaries(model.position, -10000, 10000, -16000, 4000);
    // Calculate the forward and right vectors of the camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));    

    if (gameOver) return;
    

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
        velocityY = 100;
    }

    if (model2 && Math.abs(model2.rotation.y - targetRotation) > 0.01) {
        model2.rotation.y += (targetRotation - model2.rotation.y) * 0.03; 
    } else if (isTurningBack) {
        isTurningBack = false;
    }
    
    /*if (model.position.z > -1000) { 
        showWinScreen();
        
    }*/
    
    if (checkCollision(model, forest)) {
        console.log('Collision detected!');
    }

    if (isJumping) {
        velocityY -= 3;
        model.position.y += velocityY;

        if (model.position.y <= 0) {
            model.position.y = 0;
            velocityY = 0;
            isJumping = false;
        }   
    }

    const delta = clock.getDelta();
    if (mixer) {
        if (isMoving) {
            if (!moveAction.isRunning()) {
                idleAction.stop();
                moveAction.play();
            }
        } else {
            if (!idleAction.isRunning()) {
                moveAction.stop();
                idleAction.play();
            }
        }}
        mixer.update(delta);



        
        renderer.render(scene, camera);
    
        requestAnimationFrame(() => animate(renderer, scene, camera));
}


// Execution

addlight(scene);
createGround(scene);
createSkybox(scene);
createForest(scene, -500, -5000);
createForest(scene, 3200, -8000);
createForest(scene, -2105, -2000);
createForest(scene, -5590, -6000);
createFinishLine(scene);
createControls(camera, renderer.domElement);
toggleLight();
loadModel2();
loadModel(scene, camera, renderer);

