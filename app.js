let rotationDirectionFollowsClock = true;

function rotateYMatrix(direction) {
  rotationDirectionFollowsClock = direction === 'right';
}

function createLight(color) {
  const light = new THREE.PointLight(color, 1, 1e3);
  light.position.set(0, 0, 40);

  const spotLight = new THREE.SpotLight(color);
  spotLight.position.set(0, 1e3, 1e7);
  spotLight.castShadow = true;

  return [light, spotLight];
}

const { innerWidth: W, innerHeight: H, devicePixelRatio: DPR } = window;

const COLORS = ['#7F3C8D', '#11A579', '#3969AC', '#F2B701', '#E73F74', '#80BA5A', '#E68310', '#008695', '#CF1C90', '#F97B72', '#4B4B8F', '#A5AA99'];

const AXIS = {
  X: 'X',
  Y: 'Y'
};

const PERIOD = 10;

const camera = new THREE.PerspectiveCamera(100, W / H, .1, 1e3);
const renderer = new THREE.WebGLRenderer({
  antialias: DPR && DPR < 1,
  powerPreference: 'high-performance'
});

function init() {            
  const scene = new THREE.Scene();

  const [light, spotLight] = createLight('red');
  scene.add(light);
  scene.add(spotLight);

  renderer.setClearColor(COLORS[0]);
  renderer.setSize(W, H);
  renderer.shadowMapEnabled = true;

  const cubes = [];

  for (let x = -55; x <= 85; x += 15) {
    for (let y = -70; y <= 70; y += 15) {
      const boxGeometry = new THREE.BoxGeometry(10, 10, 10);

      const randomIdxColorFromPalette = Math.floor(Math.random() * (COLORS.length - 0 + 1) + 0);

      const boxMaterial = new THREE.MeshLambertMaterial({
        emissive: COLORS[randomIdxColorFromPalette] || 'white',
        color: COLORS[randomIdxColorFromPalette] || 'white'
      });

      const box = new THREE.Mesh(boxGeometry, boxMaterial);

      box.castShadow = true;
      box.position.x = x;
      box.position.y = 0;
      box.position.z = y;

      scene.add(box);
      cubes.push(box);
    }
  }

  document.body.appendChild(renderer.domElement);

  camera.position.set(10, 150, 0);
  camera.lookAt(scene.position);

  let MAX_TIME_TO_REVERT_ROTATION = 3e3; // in seconds

  const clock = new THREE.Clock();
  const matrix = new THREE.Matrix4();

  let axisToRotateMatrixWith = AXIS.Y;
  let getColorCounter = -1;

  setInterval(() => {
    getColorCounter === COLORS.length ?
      getColorCounter = 0 :
      getColorCounter++;

    const dynamicClearColor = COLORS[getColorCounter];
    renderer.setClearColor(dynamicClearColor);
  }, MAX_TIME_TO_REVERT_ROTATION);

  function getClockEquation() {
    return rotationDirectionFollowsClock ?
      clock.getDelta() * 2 * Math.PI / PERIOD :
      -clock.getDelta() * 2 * Math.PI / PERIOD
  }

  const matrixFunctions = {
    X: (eq) => matrix.makeRotationX(eq),
    Y: (eq) => matrix.makeRotationY(eq),
    Z: (eq) => matrix.makeRotationZ(eq)
  }

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame);
    renderer.render(scene, camera);

    for (const c in cubes) {
      const offsetY = Math.sin((ts / 100) * .1) * cubes[c].position.x - 5;
      cubes[c].scale.y = offsetY;
    }

    if (axisToRotateMatrixWith === AXIS.Y) {
      matrixFunctions.Y(getClockEquation());
    }

    camera.position.applyMatrix4(matrix);
    camera.lookAt(scene.position);
  }

  drawFrame();
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

init();
