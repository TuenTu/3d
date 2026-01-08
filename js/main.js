import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { PickHelper } from "./pickhelper";

console.log(THREE);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomToCursor = true;
// controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.enableZoom = true;
controls.update();

const color = "#1E90FF";
const intensity = 6;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);
camera.position.z = 5;
console.log(cube);

const progress_line = document.querySelector(".progress_line");

const loader = new GLTFLoader();

// Добавляем переменные для анимации
let mixer = null;
let clock = new THREE.Clock(); // Добавляем часы для отслеживания времени
let playerModel = null;

loader.load(
  "../models/smol_ame_in_an_upcycled_terrarium_hololiveen.glb",
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    console.log(gltf);

    // Создаем миксер с моделью, а не с gltf объектом
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Воспроизводим все анимации
    clips.forEach(function (clip) {
      const action = mixer.clipAction(clip);
      action.play();
    });

    console.log("Animations loaded:", clips.length);
  },
  function (progress) {
    let percent = (progress.loaded * 100) / progress.total;
    progress_line.style.width = percent + "%";
    console.log(percent);
  },
  function (error) {
    console.error(error);
  }
);
loader.load(
  "../models/jailbird.glb",
  function (gltf) {
    playerModel = gltf.scene;
    playerModel.position.x = 5;
    playerModel.position.y = 0.6;
    playerModel.scale.set(0.2, 0.2, 0.2);

    scene.add(playerModel);

    console.log(gltf);

    // Создаем миксер с моделью, а не с gltf объектом
    // mixer = new THREE.AnimationMixer(playerModel);
    // const clips = gltf.animations;

    // // Воспроизводим все анимации
    // clips.forEach(function (clip) {
    //   const action = mixer.clipAction(clip);
    //   action.play();
    // });

    // console.log("Animations loaded:", clips.length);
  },
  function (progress) {
    let percent = (progress.loaded * 100) / progress.total;
    progress_line.style.width = percent + "%";
    console.log(percent);
  },
  function (error) {
    console.error(error);
  }
);

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

window.addEventListener("keydown", (e) => {
  let key = e.key.toLowerCase();
  if (keys[key] !== undefined) {
    keys[key] = true;
  }
  console.log(keys);
});

window.addEventListener("keyup", (e) => {
  let key = e.key.toLowerCase();
  if (keys[key] !== undefined) {
    keys[key] = false;
  }
  console.log(keys);
});

const speed = 0.05;

function playerMove(model) {
  if (model) {
    let moveX = 0;
    let moveZ = 0;
    if (keys.w) {
      moveZ -= speed;
    }
    if (keys.a) {
      moveX -= speed;
    }
    if (keys.s) {
      moveZ += speed;
    }
    if (keys.d) {
      moveX += speed;
    }
    model.position.x += moveX;
    model.position.z += moveZ;
    controls.target.set(playerModel.position.x, 0, playerModel.position.z);
    camera.position.set(playerModel.position.x, 2, playerModel.position.z + 6);
  }
}

const pickHelper = new PickHelper();
const pickPosition = { x: 0, y: 0 };

function animate(time) {
  // Обновляем вращение куба (если он используется)
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Обновляем анимации модели
  if (mixer) {
    const delta = clock.getDelta(); // Получаем время с последнего кадра
    mixer.update(delta);
  }

  time *= 0.001; // convert to seconds;
  pickHelper.pick(pickPosition, scene, camera, time);
  playerMove(playerModel);
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
