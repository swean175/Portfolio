import * as THREE from 'three';
 import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import nebula from '../../public/nabula.jpg'


// const loader = new GLTFLoader();
//--- window size --  window.innerWidth, window.innerHeight
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('myCanvas') });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional for smoother shadows


const textureLoader = new THREE.TextureLoader();
const normalMapTexture = textureLoader.load('public/norm.jpg');



const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

const directionLight = new THREE.DirectionalLight( 0xffffff, 2)
directionLight.castShadow = true;
scene.add( directionLight )
directionLight.position.set(4,7,4)
directionLight.shadow.camera.bottom = 0;

directionLight.shadow.camera.near = 1; 
directionLight.shadow.camera.far = 20; 
directionLight.shadow.camera.left = -5; 
directionLight.shadow.camera.right = 5; 
directionLight.shadow.camera.top = 5; 
directionLight.shadow.camera.bottom = -5;



// scene.fog = new THREE.Fog(0xFFFFFF, 20, 50);
// scene.fog = new THREE.FogExp2(0xFFFFFF, 0.03);
// const dLightHelper = new THREE.DirectionalLightHelper(directionLight)
// scene.add( dLightHelper)

const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add( spotLight );
spotLight.position.set(0,4,0);
spotLight.castShadow = true;

// const sLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(sLightHelper)


// const dLightShadowHelper = new THREE.CameraHelper(directionLight.shadow.camera);
// scene.add( dLightShadowHelper );

const geometry = new THREE.BoxGeometry( 2, 2, 2 );
const material = new THREE.MeshStandardMaterial( { color: 0x00ff00,
    wireframe: false
 } );
const cube = new THREE.Mesh( geometry, material );
cube.position.y = 2;
cube.receiveShadow = true;


// 1. Create the Cube Camera
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
});
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
scene.add(cubeCamera);




const planeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x049ef4,
    roughness: 0.1,
    metalness: 0.9,
    wireframe: false,
    envMap: cubeRenderTarget.texture,
    normalMap: normalMapTexture, 
    normalScale: new THREE.Vector2(0.1, 0.1) 
});

// planeMaterial.normalMap.wrapS = THREE.MirroredRepeatWrapping; // Repeat on the x-axis (horizontal)
// planeMaterial.normalMap.wrapT = THREE.MirroredRepeatWrapping;

const planeGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
// const groundMaterial = new THREE.MeshStandardMaterial(
//      { color: 292334,
//     side: THREE.DoubleSide,
//     roughness: 0.2, // Lower values = smoother, more reflective
//     metalness: 0.8 } );
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
 plane.rotation.x = -0.5 * Math.PI;

plane.position.y = 0;
plane.castShadow = true;
plane.reciveShadow = true;



// plane.geometry.attributes.position.array[0] = 1;
// plane.geometry.attributes.position.array[1] =1;
// plane.geometry.attributes.position.array[2] = 1;
const lastPointZ = plane.geometry.attributes.position.array.length - 1;
// plane.geometry.attributes.position.array[lastPointZ] = 1;


scene.add( plane );



const sphere2Geometry = new THREE.SphereGeometry(4);

// const vShader = `
//     void main() {
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
// `;

// const fShader = `
//     void main() {
//         gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
//     }
// `;

// const sphere2Material = new THREE.ShaderMaterial({
//     vertexShader: document.getElementById('vertexShader').textContent,
//     fragmentShader: document.getElementById('fragmentShader').textContent
// });
// const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
// scene.add(sphere2);
// sphere2.position.set(-5, 10, 10);


const clock = new THREE.Clock();


const mousePosition = new THREE.Vector2();

window,addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / 500) * 2 - 1;
    mousePosition.y = (e.clientY /500) * 2 + 1;
});


const rayCaster = new THREE.Raycaster();

const cubeId = cube.id;
cube.name = 'cub'

const count = plane.geometry.attributes.position.count

function wavy(){

const now = Date.now() / 1500
    for (let i  = 0; i < count; i++){
        const x = plane.geometry.attributes.position.getX(i);
        const y =  plane.geometry.attributes.position.getY(i);
        const xsin = (Math.sin(x + now) / 4 )
        const ycos = (Math.cos(y + now) / 8)
        plane.geometry.attributes.position.setZ(i, xsin + ycos)
    }
    plane.geometry.computeVertexNormals()
    plane.geometry.attributes.position.needsUpdate = true;
    // let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    // let vertArr = []
    // vertArr = plane.geometry.attributes.position.array
    // for (let i = 0; i < vertArr.length; i++){
    //     if (vertArr[i] < 50 || vertArr[i] > -50){
    //         // console.log('in range')
    //         vertArr[i] += 0.01 * Math.random() * plusOrMinus;
    //     } else {
    //         // console.log("out")
    //         vertArr[i] > 0 ? vertArr[i] -= 1 : vertArr[i] += 1 
    //     }
    // }

        // plane.geometry.attributes.position.array[0] += 0.01 * Math.random() * plusOrMinus ;
        // plane.geometry.attributes.position.array[1] += 0.01 * Math.random() * plusOrMinus; 
        // plane.geometry.attributes.position.array[2] +=  0.01 * Math.random() * plusOrMinus;
        // plane.geometry.attributes.position.array[lastPointZ] +=  0.01 * Math.random() * plusOrMinus;
        // plane.geometry.attributes.position.needsUpdate = true;

}

console.log(plane.geometry.attributes.position.array[10])

function animate(){
    requestAnimationFrame(animate)

    cubeCamera.position.copy(plane.position); 
    cubeCamera.update(renderer, scene);

    const elapsedTime = clock.getElapsedTime();

    // Animate the normal map's offset (UV coordinates)
    planeMaterial.normalMap.offset.x = elapsedTime * 0.01;
    planeMaterial.normalMap.offset.y = elapsedTime * 0.005;

   

    scene.add( cube );


    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);

    for (let i = 0 ; i < intersects.length; i++){
        if(intersects[i].object.id === cubeId){
            intersects[i].object.material.color.set(0xFF0000)
            // console.log(intersects)
        } if (intersects[i].object.name === 'cub'){
            intersects[i].rotation.x += 0.001
        }
    };

  
if (elapsedTime % 2 !== 0){
    wavy()
}

   
    renderer.render(scene, camera)
}




const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([nebula, nebula, nebula, nebula, nebula, nebula]);



// scene.background = textureLoader.load(nebula)

renderer.setClearAlpha(0xFFFFFF)
// const gridHelper = new THREE.GridHelper(50);
// scene.add( gridHelper )

camera.position.set(-10, 20, 30)
controls.update()


renderer.setAnimationLoop(animate)

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

