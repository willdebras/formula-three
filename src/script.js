import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
//scene.add(axesHelper)

const fogColor = new THREE.Color('#ffcccb');
scene.background = fogColor
scene.fog = new THREE.Fog(fogColor, 10, 30);

// Env

// Floor

const textureLoader = new THREE.TextureLoader()

const marbleColor = textureLoader.load('/textures/floor/marble_0008_base_color_4k.jpg')
const marbleNormal = textureLoader.load('/textures/floor/marble_0008_normal_4k.jpg')
const marbleRoughness = textureLoader.load('/textures/floor/marble_0008_roughness_4k.jpg')
const marbleAO = textureLoader.load('/textures/floor/marble_0008_ao_4k.jpg')

marbleColor.wrapS = marbleColor.wrapT = THREE.RepeatWrapping;
marbleColor.repeat.set( 100, 100 )
marbleColor.anisotropy = 16
marbleColor.encoding = THREE.sRGBEncoding


//var groundMaterial = new THREE.MeshStandardMaterial( { map: marbleColor } )
const groundMaterial = new THREE.MeshStandardMaterial( { color: '#ffcccb' } )

const mesh = new THREE.Mesh( new THREE.CircleBufferGeometry( 30, 30 ), groundMaterial )
mesh.position.y = 0
mesh.rotation.x =- Math.PI / 2
mesh.receiveShadow = true
mesh.refractionRatio = 0
scene.add( mesh )

//baked shadows 

const bakedShadow = textureLoader.load('/textures/car_shadow_gauss.png')

var shadow = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(4,7.2),
    new THREE.MeshStandardMaterial({map: bakedShadow})
)

shadow.position.y = 0.01
shadow.rotation.x =- Math.PI / 2

scene.add(shadow)

/**
 * Base
 */
// Debug
const debugObject = {}


/**
 * LOADERS
 */

/**
 * CAR
 */


const gltfLoader = new GLTFLoader()

gltfLoader.load(
    '/textures/f1_gltf/scene.gltf',
    (gltf) =>
    {
        scene.add(gltf.scene)
        // for(const child of gltf.scene.children)
        // {
        //     scene.add(child)
        // }
        updateAllMaterials()
    }
)

// env mapping

const cubeTextureLoader = new THREE.CubeTextureLoader()
//const rgbeLoader = new RGBELoader()

/**
 * Environment map
 */
//  const environmentMap = cubeTextureLoader.load([
//     '/textures/environmentMaps/venice/px.png',
//     '/textures/environmentMaps/venice/nx.png',
//     '/textures/environmentMaps/venice/py.png',
//     '/textures/environmentMaps/venice/ny.png',
//     '/textures/environmentMaps/venice/pz.png',
//     '/textures/environmentMaps/venice/nz.png'
// ])

const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

environmentMap.encoding = THREE.sRGBEncoding

//scene.background = environmentMap
scene.environment = environmentMap

debugObject.envMapIntensity = 2
//for venice
//debugObject.envMapIntensity = 1.2

gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(()=> {
    updateAllMaterials()
})

/**
 * Update all materials
 */
 const updateAllMaterials = () =>
 {
     scene.traverse((child) =>
     {
         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
         {
             // child.material.envMap = environmentMap
             child.material.envMapIntensity = debugObject.envMapIntensity
             child.material.needsUpdate = true
             child.castShadow = true
             child.receiveShadow = true
         }
     })
 }

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const parameters = {
    toneMapping: 1,
    ambientColor: '#FAF9F6'
}

/**
 * lights
 */

 const ambientLight = new THREE.AmbientLight('#FAF9F6', 0.9)
 scene.add(ambientLight)
 gui.add(ambientLight, 'intensity', 0, 5, 0.001).name('ambientIntensity')

const direcLight = new THREE.DirectionalLight('#FAF9F6', 1)
direcLight.position.set(2.8, 2.5, 2.5)
direcLight.position.set(2.8, 2.5, -5)
direcLight.intensity = 0.4
direcLight.castShadow = true
// will reduce the normal bias on shadowing, prevents the shadow acne
direcLight.shadow.mapSize.set(1024, 1024)
direcLight.shadow.normalBias = 0.05
scene.add(direcLight)

direcLight.shadow.mapSize.width = 512
direcLight.shadow.mapSize.height = 512
direcLight.shadow.camera.near = 0.5    
direcLight.shadow.camera.far = 15
direcLight.shadow.camera.top = 10;
direcLight.shadow.camera.bottom = - 10;
direcLight.shadow.camera.left = - 10;
direcLight.shadow.camera.right = 10;


gui.add(direcLight.position, 'x', -5, 20, 0.0001).name('lightx')
gui.add(direcLight.position, 'y', -5, 20, 0.0001).name('lighty')
gui.add(direcLight.position, 'z', -5, 20, 0.0001).name('lightz')
gui.add(direcLight, 'intensity', 0, 5, 0.001).name('direcIntensity')

const targetObject = new THREE.Object3D();
scene.add(targetObject);


const helper = new THREE.CameraHelper( direcLight.shadow.camera )
//scene.add( helper );


const pointLight = new THREE.PointLight('#FAF9F6', 0.6)
pointLight.position.x = 1
pointLight.position.y = 2.8
pointLight.position.z = 1
scene.add(pointLight)

gui.add(pointLight.position, 'x', -5, 20, 0.0001).name('pointx')
gui.add(pointLight.position, 'y', -5, 20, 0.0001).name('pointy')
gui.add(pointLight.position, 'z', -5, 20, 0.0001).name('pointz')
gui.add(pointLight, 'intensity', 0, 5, 0.001).name('pointIntensity')



/**
 * Camera
 */
// Base camera

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(-2.57, 1.64, 3.51)
camera.rotation.set(-0.437, -0.586, -0.25)

gui.add(camera.position, 'x', -20, 20, 0.0001).name('camx')
gui.add(camera.position, 'y', -20, 20, 0.0001).name('camy')
gui.add(camera.position, 'z', -20, 20, 0.0001).name('camz')
gui.add(camera.rotation, 'x', -20, 20, 0.0001).name('camxrotate')
gui.add(camera.rotation, 'y', -20, 20, 0.0001).name('camyrotate')
gui.add(camera.rotation, 'z', -20, 20, 0.0001).name('camzrotate')

// Controls
//const controls = new OrbitControls(camera, canvas)
//controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true,
    antialias: true
})

// converting hdr values to ldr values via tonemapping
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = parameters.toneMapping
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding


gui
    .add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    })
    .onFinishChange(() =>
    {
        renderer.toneMapping = Number(renderer.toneMapping)
        updateAllMaterials()
    })

gui.add(renderer, 'toneMappingExposure').min(0).max(5).step(0.01)

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/**
 * Animate
 */
const clock = new THREE.Clock()

// controls.addEventListener( "change", event => {  
//     console.log( controls.object.position ); 
//     console.log( controls.object.rotation ); 
// })

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
     //controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

/**
 * scroll triggers
 */


 ScrollTrigger.create({
    trigger: "#canvas-wrapper",
    start: "top top",
    endTrigger: "html",
    end: "bottom top",
    pin: true,
    pinSpacing: false,
    toggleActions: 'play none none reverse',
    
  });


// starting camera position and rotation

gsap.to(camera.position, {
    x: -2.57, y: 1.64, z: 3.51
  })

  gsap.to(camera.rotation, {
    x: -0.437, y: -0.586, z: -0.25
  })




 gsap.fromTo(camera.position, 
    {x: -2.57, y: 1.64, z: 3.51},
    {
    scrollTrigger: {
        trigger: "#section2",
        start: 'top 50%',
        // start: 'top 80%',
        // end: 'top 10%',
        //end: 'bottom 30%',
        toggleActions: 'play none none reverse',
        id: 'first-position',
        scrub:false,
        markers:false,
    },
        x: 2.2, y: 0.5, z: 1.2,
        duration:1.3,
        ease: 'power2.inOut'
  });

  gsap.fromTo(camera.rotation,
    {x: -0.437, y: -0.586, z: -0.25},
    {
    scrollTrigger: {
        trigger: "#section2",
        start: 'top 50%',
        // start: 'top 80%',
        // end: 'top 10%',
        toggleActions: 'play none none reverse',
        id: 'first-rotation',
        markers:false,
        scrub:false,
    },
        x:0, y: 1.8, z: 0,
        duration:1.7,
        ease: 'power2.inOut'
  });

  gsap.fromTo(camera.position,
    {   x: 2.2, y: 0.5, z: 1.2},
    {
    scrollTrigger: {
        trigger: "#section3",
        start: 'top 50%',
        // start: 'top 80%',
        // end: 'top 10%',
        toggleActions: 'play none none reverse',
        id: 'second-position',
        markers:false,
        scrub:false
    },
    x: 0.9, y: 1.3, z: -1,
    ease: 'power2.inOut',
    duration: 1
  });

gsap.fromTo(camera.rotation, 
    {x:0, y: 1.8, z: 0},
    {
    scrollTrigger: {
        trigger: "#section3",
        start: 'top 50%',
        // start: 'top 80%',
        // end: 'top 10%',
        toggleActions: 'play none none reverse',
        id: 'second-rotation',
        markers:false,
        scrub: false
    },
    x: -0.2, y: 0.83, z: 0.1,
    ease: 'power2.inOut',
    duration: 1
  });

  gsap.fromTo(camera.position,
    {x: 0.9, y: 1.3, z: -1},
    {
    scrollTrigger: {
        trigger: "#section4",
        start: 'top 50%',
        toggleActions: 'play none none reverse',
        id: 'second-position',
        markers:false,
    },
    x: 2.3, y: 1.3, z: 3,
    ease: 'power2.inOut',
    duration: 1
  });

gsap.fromTo(camera.rotation, 
    {x: -0.2, y: 0.83, z: 0.1},
    {
    scrollTrigger: {
        trigger: "#section4",
        start: 'top 50%',
        toggleActions: 'play none none reverse',
        id: 'second-rotation',
        markers:false,
    },
    x: -0.3, y: 0.5, z: 0.1,
    ease: 'power2.inOut',
    duration: 1
  });

  gsap.fromTo(camera.position,
    {x: 2.3, y: 1.3, z: 3},
    {
    scrollTrigger: {
        trigger: "#section5",
        start: 'top 50%',
        toggleActions: 'play none none reverse',
        id: 'second-position',
        markers:false,
    },
    x: 0.5, y: 0.7, z: -4,
    ease: 'power2.inOut',
    duration: 1
  });

gsap.fromTo(camera.rotation, 
    {x: -0.3, y: 0.5, z: 0.1},
    {
    scrollTrigger: {
        trigger: "#section5",
        start: 'top 50%',
        toggleActions: 'play none none reverse',
        id: 'second-rotation',
        markers:false,
    },
    x: 0, y: 3.14, z: 0,
    ease: 'power2.inOut',
    duration: 1
  });


  gsap.fromTo(camera.position,
    {x: 0.5, y: 0.7, z: -4},
    {
    scrollTrigger: {
        trigger: "#section6",
        start: 'top 50%',
        toggleActions: 'play none none reverse',
        id: 'second-position',
        markers:false,
    },
    x: 0, y: 0.9, z: -0.1,
    ease: 'power2.inOut',
    duration: 1
  });

gsap.fromTo(camera.rotation, 
    {x: 0, y: 3.14, z: 0},
    {
    scrollTrigger: {
        trigger: "#section6",
        start: 'top 50%',
        toggleActions: 'play none none reverse',
        id: 'second-rotation',
        markers:false,
    },
    x: 0, y: 3.1, z: 0,
    ease: 'power2.inOut',
    duration: 1
  });

  ScrollTrigger.create({
    trigger: "#contact",
    start: "top 70%",
    toggleActions: 'play none none reverse',
    toggleClass: {targets: ".fade", className: "blurred"},
    markers:false
  });