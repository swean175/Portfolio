




import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
 import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
 import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
 import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
 import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
 import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
 import Lenis from '@studio-freight/lenis'
 import { Water } from 'three/addons/objects/Water.js';
 import { Sky } from 'three/addons/objects/Sky.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import nebula from '../../public/nabula.jpg'
// import lake from '../../public/foggy-lake.jpg'
const canv = document.getElementById('three')

const clock = new THREE.Clock();
const mousePosition = new THREE.Vector2();

let sun, water
let planePos = 2.5
let waveCount = 0
let scrollCount = 0

const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const params = {
    threshold: 0.2,
    strength: 0.5,
    radius: 0.8,
    exposure: 0.6
};

const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {};



// const loader = new GLTFLoader();
//--- window size --  window.innerWidth, window.innerHeight
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, canv.clientWidth/ canv.clientHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	alpha:true});
renderer.shadowMap.enabled = true;
 renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional for smoother shadows


const textureLoader = new THREE.TextureLoader();
const normalMapTexture = textureLoader.load('public/norm.jpg');

// const controls = new OrbitControls( camera, renderer.domElement );


renderer.setPixelRatio(Math.max(1, window.devicePixelRatio / 2)) //----zmienić na max<--<--<-
renderer.setSize(canv.clientWidth, canv.clientHeight );

canv.appendChild( renderer.domElement );

camera.position.set(0.3, 4, 13)
camera.lookAt(0,2,0)


//LENIS------------------------------------------------------------------------

let loopCount = 0
// const top = document.getElementById('top')
// const bottom = document.getElementById('bottom')

const lenis = new Lenis({
duration: 1.2,
easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
direction: 'vertical', // vertical, horizontal
gestureDirection: 'vertical', // vertical, horizontal, both
smooth: true,
mouseMultiplier: 1,
smoothTouch: false,
touchMultiplier: 2,
infinite: false,
})

//get scroll value
lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
console.log({ scroll, limit, velocity, direction, progress })
console.log('cam z '+camera.position.z+' loopCount '+loopCount+' actual Scroll = '+lenis.actualScroll+' is scrolling = '+lenis.isScrolling+' is locked = '+lenis.isLocked)
})


function raf(time) {
lenis.raf(time)

requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

//CAMERA---MOVE----TRACK-----RESET--------------------------------------------
let startRot = 0
let animIsActive = false
let totalSteps = 0
let currentStep = 'first'
const animRate = 600 
const firstDist = {x:0.1, y:4, z:13}
const secDist = {x:-0.1, y:4.1, z:10.5}
const thrDist = {x:-0.3, y:4.2, z:8}

function cameraTrack(){


	if ((lenis.scroll === 0 && loopCount === -animRate) || (lenis.scroll === 0 && lenis.velocity < -50)){
		console.log('drive 1 - totalSteps = ' + totalSteps)
		cameraReset(firstDist)
		lenis.direction = undefined
		currentStep = 'first'
		totalSteps = 0
		animIsActive = false
		scrollCount = 0
	}

	if ((totalSteps === animRate && camera.position.z <= 10.5 && camera.position.z >= 8)  || ((lenis.scroll < 0 && camera.position.z < 10.5 ) && currentStep === 'cube')){
		console.log('drive 2 - totalSteps = ' + totalSteps)
		cameraReset(secDist)
		currentStep = 'second'
	}

	if ((totalSteps === 1200 && currentStep === 'second' ) || (lenis.velocity < -50 && cube.rotation.y > 0)){
		console.log('drive 3 + cam z = '+  camera.position.z + ' totalSteps = ' + totalSteps)
		cameraReset(thrDist)
		currentStep = 'cube'
		startRot = 0
		cube.rotation.y = 0
	}

	firstStop()
	secondStop()
	rotateCube()

	
}



function cameraReset({x, y, z}){
	animIsActive = false
	console.log('camera reseted ' + z)
	camera.position.set(x, y, z)
	camera.lookAt(0,2,0)
	loopCount = 0
	cube.rotation.y = 0

}



function firstStop(){
	
	if ( loopCount < animRate && loopCount > -animRate && lenis.scroll >= 0 && (currentStep === 'second' || currentStep === 'first')){
		if (camera.position.z > 10.5 || (camera.position.z === 10.5 && lenis.direction < 0 )){
			console.log('first stop - totalSteps = '+ totalSteps)
			moveCamera()

			if (camera.position.z < 10.51 && lenis.direction > 0){
				cameraReset(secDist)
				currentStep = 'second'
			}
		}
	}
}


function secondStop(){

	if ( camera.position.z <= 10.5 && loopCount <= animRate && loopCount >= -animRate && (currentStep === 'second' || currentStep === 'cube')){
		if ((cube.rotation.y === 0 && camera.position.z >= 8 && lenis.direction < 0) || (lenis.direction > 0 && camera.position.z > 8)){
				console.log('2 stop - totalSteps = '+ totalSteps)
				moveCamera()
	}	
  }
}


function rotateCube(){
	const fullRot = THREE.MathUtils.degToRad(360)
	const oneRot = THREE.MathUtils.degToRad(90)
if ( camera.position.z === 8 && currentStep === 'cube' && animIsActive){
	console.log('cube rotation')
		if (lenis.direction < 0 || cube.rotation.y > fullRot){
			cameraReset(thrDist)
			console.log('cube ended')
		}
	if ( lenis.direction > 0 && ( cube.rotation.y / oneRot) <= 4){
	console.log('startRot = '+startRot + ' y '+ cube.rotation.y + ' fullRot = '+ fullRot)
	cube.rotation.y <= (startRot + oneRot) ? cube.rotation.y += THREE.MathUtils.degToRad(0.1 + lenis.velocity): animIsActive = false
	} else {
		animIsActive = false
	}
  }
}


// document.body.onscroll = moveCamera
// window.addEventListener('scroll', moveCamera);

function moveCamera(){
const moveDist = 2.5/animRate 
        // const x = camera.position.x;
        // const y =  camera.position.y;
        // const xsin = (Math.sin(x + now) / 8 )
        // const ycos = (Math.cos(y + now) / 16)

	// const t = document.body.getBoundingClientRect().top;
	if (lenis.direction > 0 && camera.position.z > 8) {
		loopCount += 1
//  for (let i = 0; i > 100; i++ )
			// console.log("+")
			camera.position.y += 0.00015 ;
			camera.position.x += 0.0003 ;
			camera.position.z -= moveDist;
			camera.lookAt(0,2,0)
			totalSteps += 1
	}
		
if (lenis.direction < 0 && camera.position.z < 13)  {
	loopCount -= 1
	// console.log('-')
	// for (let i = 0; i > 100; i++ )
		camera.position.y -= 0.00015 ;
		camera.position.x -= 0.0003 ;
		camera.position.z += moveDist;
		camera.lookAt(0,2,0)
		totalSteps -= 1
	}


}
			

//CAMERA WAVING----------------------------------------------------------
let waveDirection = true
function cameraWaving(){
	

	if (waveCount === 3000){
		if (waveDirection){
			waveCount = 6000
			waveDirection = !waveDirection
		} else {
			waveCount = 0
			waveDirection = !waveDirection
		}
	}

	if (waveCount < 3000){
		// console.log('up')
		bgPlane.position.y -= 0.0005;
		camera.position.y += 0.0001;
		camera.position.x += 0.00002;
		// camera.position.z += -0.0001;
		waveCount++
	} else {
		// console.log('down')
		bgPlane.position.y += 0.0005;
		camera.position.y -= 0.0001;
		camera.position.x -= 0.00002;
		// camera.position.z -= -0.0001;
		waveCount--
	}

}

	
	// camera.position.y = 3.5;
	// camera.position.x = 1;


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




sun = new THREE.Vector3();

// Water

const waterGeometry = new THREE.PlaneGeometry( 100, 100 );

water = new Water(
	waterGeometry,
	{
		textureWidth: 1024,
		textureHeight: 1024,
		waterNormals: new THREE.TextureLoader().load( 'public/norm.jpg', function ( texture ) {

			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		} ),
		sunDirection: new THREE.Vector3(),
		sunColor: 0x4F1E71,
		waterColor: 0x8694CD,
		distortionScale: 0.7,
		fog: scene.fog !== undefined,
		size: 0.5
	}
);

water.rotation.x = - Math.PI / 2;
// water.scale.x = 20;
// water.scale.y = 20;

water.receiveShadow = true
scene.add( water );

// Skybox

// const sky = new Sky();
// sky.scale.setScalar( 10000 );
// scene.add( sky );

// const skyUniforms = sky.material.uniforms;

// skyUniforms[ 'turbidity' ].value = 10;
// skyUniforms[ 'rayleigh' ].value = 5;
// skyUniforms[ 'mieCoefficient' ].value = 0.005;
// skyUniforms[ 'mieDirectionalG' ].value = 0.8;

// const parameters = {
// 	elevation: 2.2,
// 	azimuth: 190
// };

// const pmremGenerator = new THREE.PMREMGenerator( renderer );
// const sceneEnv = new THREE.Scene();

// let renderTarget;

// function updateSun() {

// 	const phi = THREE.MathUtils.degToRad( 94 - parameters.elevation );
// 	const theta = THREE.MathUtils.degToRad( parameters.azimuth );

// 	sun.setFromSphericalCoords( 1, phi, theta );

// 	sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
// 	water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

// 	if ( renderTarget !== undefined ) renderTarget.dispose();

// 	sceneEnv.add( sky );
// 	renderTarget = pmremGenerator.fromScene( sceneEnv );
// 	scene.add( sky );

// 	scene.environment = renderTarget.texture;

// }

// updateSun();


//WATER AND SKY KURWA ----------------------------------------------------------------


// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);


// const light = new THREE.AmbientLight( 0x4F1E71, 50 ); // soft purple light
// scene.add( light );


// const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.2 );
// scene.add( light );
//--------------HEMI LIGHT
// const light = new THREE.AmbientLight( 0xb2a8ad, 0.3 );
// scene.add( light );
//--------------AMBIENT LIGHT


// const directionLight = new THREE.DirectionalLight( 0xffffff, 1)
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


//049ef4  ffffbb
// scene.fog = new THREE.Fog(0xFFFFFF, 20, 50);

 scene.fog = new THREE.FogExp2(0x6D8993, 0.05);


// const dLightHelper = new THREE.DirectionalLightHelper(directionLight)
// scene.add( dLightHelper)

const pointLight = new THREE.PointLight(0xB6C2D9);

pointLight.position.set(0,1,8);
pointLight.castShadow = true; //------------ prawe
pointLight.distance = 7
pointLight.power = 30
pointLight.decay = 0.4


//Set up shadow properties for the light
pointLight.shadow.mapSize.width = 512; // default
pointLight.shadow.mapSize.height = 512; // default
pointLight.shadow.camera.near = 0.5; // default
pointLight.shadow.camera.far = 500; // default
scene.add( pointLight );
 const pLightHelper = new THREE.PointLightHelper(pointLight);
 scene.add(pLightHelper)

const pointLight2 = new THREE.PointLight(0x326BDC);

pointLight2.position.set(-6,7,3);
pointLight2.castShadow = true;
pointLight2.distance = 30  //-------------------- lewe
pointLight2.power = 100
pointLight2.decay = 0.1


//Set up shadow properties for the light
pointLight2.shadow.mapSize.width = 512; // default
pointLight2.shadow.mapSize.height = 512; // default
pointLight2.shadow.camera.near = 0.5; // default
pointLight2.shadow.camera.far = 500; // default
scene.add( pointLight2 );

const pLightHelper2 = new THREE.PointLightHelper(pointLight2);
 scene.add(pLightHelper2)


//const dLightShadowHelper = new THREE.CameraHelper(directionLight.shadow.camera);
 //scene.add( dLightShadowHelper );

//--------------GEOMETRY----------------------------------

const geometry = new THREE.BoxGeometry( 4, 4, 4 );
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


 //scene.add( plane );

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

 //scene.add(bgPlane)


//-------------------------------------  LOGIC

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




window,addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX /  canv.clientWidth) * 2 - 1;
    mousePosition.y = (e.clientY / canv.clientHeight) * 2 + 1;
  
});


// const rayCaster = new THREE.Raycaster();

// const cubeId = cube.id;
// cube.name = 'cub'

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

	// if (lenis.__isScrolling){
	// 	console.log('cameraTrack')
	// 	cameraTrack()

	// }

	// if((lenis.progress > 0.1 && lenis.progress < 0.3) && (scrollCount > 0 && scrollCount < 4)){
	// 	animIsActive = false
	// } 

	if (animIsActive){
		cameraTrack()
	}
	
	
	
    scene.add( cube );


    // rayCaster.setFromCamera(mousePosition, camera);
    // const intersects = rayCaster.intersectObjects(scene.children);

    // for (let i = 0 ; i < intersects.length; i++){
    //     if(intersects[i].object.id === cubeId){
    //         intersects[i].object.material.color.set(0xFF0000)
    //         // console.log(intersects)
    //         intersects[i].rotation.x += 0.001
    //     }
    // };

  
if (elapsedTime % 2 !== 0){
    wavy()
	 cameraWaving()

}

render()
    // renderer.render(scene, camera)
}




window.addEventListener('scroll', () => {
	startRot = cube.rotation.y
	animIsActive = true
	if (lenis.direction > 0){
		scrollCount += 1
	} else if (lenis.direction < 0){
		scrollCount -= 1
	}
	
	console.log('scrollCount = '+ scrollCount)
})

cube.layers.toggle( BLOOM_SCENE )
//plane.layers.toggle( BLOOM_SCENE )

// const cubeTextureLoader = new THREE.CubeTextureLoader();
// scene.background = cubeTextureLoader.load([nebula, nebula, nebula, nebula, nebula, nebula]);


// const TextureLoader = new THREE.TextureLoader()
// const lakeTexture = TextureLoader.load(lake);

// scene.background = lakeTexture;
// scene.backgroundIntensity = 0.2


// renderer.setClearColor(0x1035CA)
 //renderer.setClearAlpha(0x000000)
// const gridHelper = new THREE.GridHelper(50);
// scene.add( gridHelper )

// camera.position.set(0, 4, 13)
// controls.update()



renderer.setAnimationLoop(animate)

window.addEventListener('resize', function() {
    camera.aspect =  canv.clientWidth /  canv.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( canv.clientWidth,  canv.clientHeight);
});
