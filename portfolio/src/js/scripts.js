import * as THREE from 'three';
 import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
 import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
 import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
 import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
 import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
 import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import nebula from '../../public/nabula.jpg'
const canv = document.getElementById('three')
let planePos = 2.5

const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const params = {
    threshold: 0.3,
    strength: 0.3,
    radius: 1,
    exposure: 0.5
};

const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {};



// const loader = new GLTFLoader();
//--- window size --  window.innerWidth, window.innerHeight
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, canv.clientWidth/ canv.clientHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
 renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional for smoother shadows


const textureLoader = new THREE.TextureLoader();
const normalMapTexture = textureLoader.load('public/norm.jpg');



const controls = new OrbitControls( camera, renderer.domElement );


renderer.setPixelRatio(Math.max(1, window.devicePixelRatio / 2))
renderer.setSize(canv.clientWidth, canv.clientHeight );
canv.appendChild( renderer.domElement );


//BLOOM----------------------------------------------------------------------------------

const renderScene = new RenderPass( scene, camera );
//     window.innerWidth, window.innerHeight
			const bloomPass = new UnrealBloomPass( new THREE.Vector2(canv.clientWidth, canv.clientHeight  ), 1.5, 0.4, 0.85 );
			bloomPass.threshold = params.threshold;
			bloomPass.strength = params.strength;
			bloomPass.radius = params.radius;

			const bloomComposer = new EffectComposer( renderer );
			bloomComposer.renderToScreen = false;
			bloomComposer.addPass( renderScene );
			bloomComposer.addPass( bloomPass );

			const mixPass = new ShaderPass(
				new THREE.ShaderMaterial( {
					uniforms: {
						baseTexture: { value: null },
						bloomTexture: { value: bloomComposer.renderTarget2.texture }
					},
					vertexShader: document.getElementById( 'vertexshader' ).textContent,
					fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
					defines: {}
				} ), 'baseTexture'
			);
			mixPass.needsSwap = true;

			const outputPass = new OutputPass();

			const finalComposer = new EffectComposer( renderer );
			finalComposer.addPass( renderScene );
			finalComposer.addPass( mixPass );
			finalComposer.addPass( outputPass );

			// const raycaster = new THREE.Raycaster();

			// const mouse = new THREE.Vector2();

			// window.addEventListener( 'pointerdown', onPointerDown );

			const gui = new GUI();

			const bloomFolder = gui.addFolder( 'bloom' );

			bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

				bloomPass.threshold = Number( value );
				render();

			} );

			bloomFolder.add( params, 'strength', 0.0, 3 ).onChange( function ( value ) {

				bloomPass.strength = Number( value );
				render();

			} );

			bloomFolder.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

				bloomPass.radius = Number( value );
				render();

			} );

			const toneMappingFolder = gui.addFolder( 'tone mapping' );

			toneMappingFolder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

				renderer.toneMappingExposure = Math.pow( value, 4.0 );
				render();

			} );

			setupScene();

			// function onPointerDown( event ) {

			// 	mouse.x = ( event.clientX / 500 ) * 2 - 1;
			// 	mouse.y = - ( event.clientY / 500 ) * 2 + 1;

			// 	raycaster.setFromCamera( mouse, camera );
			// 	const intersects = raycaster.intersectObjects( scene.children, false );
			// 	if ( intersects.length > 0 ) {

			// 		const object = intersects[ 0 ].object;
					// object.layers.toggle( BLOOM_SCENE );
			// 		render();

			// 	}

			// }

        

			window.onresize = function () {
                
				const width =  canv.clientWidth;
				const height =  canv.clientHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );

				bloomComposer.setSize( width, height );
				finalComposer.setSize( width, height );

				render();

			};

			function setupScene() {

				scene.traverse( disposeMaterial );
				scene.children.length = 0;

				// const geometry = new THREE.IcosahedronGeometry( 1, 15 );

				// for ( let i = 0; i < 50; i ++ ) {

				// 	const color = new THREE.Color();
				// 	color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );

				// 	const material = new THREE.MeshBasicMaterial( { color: color } );
				// 	const sphere = new THREE.Mesh( geometry, material );
				// 	sphere.position.x = Math.random() * 10 - 5;
				// 	sphere.position.y = Math.random() * 10 - 5;
				// 	sphere.position.z = Math.random() * 10 - 5;
				// 	sphere.position.normalize().multiplyScalar( Math.random() * 4.0 + 2.0 );
				// 	sphere.scale.setScalar( Math.random() * Math.random() + 0.5 );
				// 	scene.add( sphere );

				// 	if ( Math.random() < 0.25 ) sphere.layers.enable( BLOOM_SCENE );

				// }

				render();

			}

			function disposeMaterial( obj ) {

				if ( obj.material ) {

					obj.material.dispose();

				}

			}

			function render() {

				scene.traverse( darkenNonBloomed );
				bloomComposer.render();
				scene.traverse( restoreMaterial );

				// render the entire scene, then render bloom scene on top
				finalComposer.render();
                
			}

			function darkenNonBloomed( obj ) {

				if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {

					materials[ obj.uuid ] = obj.material;
					obj.material = darkMaterial;

				}

			}

			function restoreMaterial( obj ) {

				if ( materials[ obj.uuid ] ) {

					obj.material = materials[ obj.uuid ];
					delete materials[ obj.uuid ];

				}

			}

//BLOOM -----------------------------------------------------------------------------------


// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);


// const light = new THREE.AmbientLight( 0x404040, 10 ); // soft white light
// scene.add( light );


const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.5 );
scene.add( light );


// const directionLight = new THREE.DirectionalLight( 0xffffff, 2)
// directionLight.castShadow = true;
// scene.add( directionLight )
// directionLight.position.set(4,7,4)
// directionLight.shadow.camera.bottom = 0;

// directionLight.shadow.camera.near = 1; 
// directionLight.shadow.camera.far = 20; 
// directionLight.shadow.camera.left = -5; 
// directionLight.shadow.camera.right = 5; 
// directionLight.shadow.camera.top = 5; 
// directionLight.shadow.camera.bottom = -5;



// scene.fog = new THREE.Fog(0xFFFFFF, 20, 50);
scene.fog = new THREE.FogExp2(0x049ef4, 0.05);
// const dLightHelper = new THREE.DirectionalLightHelper(directionLight)
// scene.add( dLightHelper)

const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add( spotLight );
spotLight.position.set(0,8,0);
spotLight.castShadow = true;
spotLight.distance = 150
spotLight.intensity = 50
spotLight.power = 50
spotLight.decay = 1


//Set up shadow properties for the light
spotLight.shadow.mapSize.width = 512; // default
spotLight.shadow.mapSize.height = 512; // default
spotLight.shadow.camera.near = 0.5; // default
spotLight.shadow.camera.far = 500; // default

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


//1. Create the Cube Camera
// const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
//     format: THREE.RGBFormat,
//     generateMipmaps: true,
//     minFilter: THREE.LinearMipmapLinearFilter
// });
// const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
// scene.add(cubeCamera);




const planeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x049ef4,
    roughness: 0.1,
    metalness: 0.7,
    wireframe: false,
    // envMap: cubeRenderTarget.texture,
    normalMap: normalMapTexture, 
    normalScale: new THREE.Vector2(0.1, 0.1) 
});

// planeMaterial.normalMap.wrapS = THREE.MirroredRepeatWrapping; // Repeat on the x-axis (horizontal)
// planeMaterial.normalMap.wrapT = THREE.MirroredRepeatWrapping;

const planeGeometry = new THREE.PlaneGeometry(20, 20, 10, 10);
// const groundMaterial = new THREE.MeshStandardMaterial(
//      { color: 292334,
//     side: THREE.DoubleSide,
//     roughness: 0.2, // Lower values = smoother, more reflective
//     metalness: 0.8 } );
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
 plane.rotation.x = -0.5 * Math.PI;
  plane.rotation.z = 2

plane.position.y = 0;
plane.position.z = planePos;
plane.reciveShadow = true;



// plane.geometry.attributes.position.array[0] = 1;
// plane.geometry.attributes.position.array[1] =1;
// plane.geometry.attributes.position.array[2] = 1;
//const lastPointZ = plane.geometry.attributes.position.array.length - 1;
// plane.geometry.attributes.position.array[lastPointZ] = 1;


scene.add( plane );

//------------- background plane
const bgPlaneGeometry = new THREE.PlaneGeometry(40,10)
const bgPlaneMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x049ef4,
    roughness: 0.1,
    metalness: 0.7,
    wireframe: false,
    normalMap: normalMapTexture, 
    normalScale: new THREE.Vector2(0.1, 0.1) 
});
const bgPlane = new THREE.Mesh(bgPlaneGeometry, bgPlaneMaterial);

bgPlane.rotation.x = -0.45 * Math.PI;

bgPlane.position.y = 0.1;
bgPlane.position.z = -5;
scene.add(bgPlane)

//-------------------------------------

// const sphere2Geometry = new THREE.SphereGeometry(4);

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
    mousePosition.x = (e.clientX /  canv.clientWidth) * 2 - 1;
    mousePosition.y = (e.clientY / canv.clientHeight) * 2 + 1;
  
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



function animate(){
    requestAnimationFrame(animate)

    // cubeCamera.position.copy(plane.position); //----reflections
    // cubeCamera.update(renderer, scene);

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
            intersects[i].rotation.x += 0.001
        }
    };

  
if (elapsedTime % 2 !== 0){
    wavy()
}

render()
    // renderer.render(scene, camera)
}


cube.layers.toggle( BLOOM_SCENE )
plane.layers.toggle( BLOOM_SCENE )

// const cubeTextureLoader = new THREE.CubeTextureLoader();
// scene.background = cubeTextureLoader.load([nebula, nebula, nebula, nebula, nebula, nebula]);



// scene.background = textureLoader.load(nebula)

 //renderer.setClearAlpha(0x000000)
// const gridHelper = new THREE.GridHelper(50);
// scene.add( gridHelper )

camera.position.set(0, 4, 13)
controls.update()


renderer.setAnimationLoop(animate)

window.addEventListener('resize', function() {
    camera.aspect =  canv.clientWidth /  canv.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( canv.clientWidth,  canv.clientHeight);
});


