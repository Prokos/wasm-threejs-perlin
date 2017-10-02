import * as THREE from 'three';

import OrbitControls from 'lib/OrbitControls.js';

import loadWebAssemblyModule from 'wasm/perlinNoise.wasm';

export const memory = new WebAssembly.Memory({ initial: 256 });
export const table = new WebAssembly.Table({ initial: 0, element: 'anyfunc' });

export const heapU8 = new Uint8Array(memory.buffer);

const heightResolution = 10; // Amount of decimals
const width = 75;
const height = 75;
const boxDimensions = {
	width: 50,
	height: 10,
	depth: 50,
};
const geometry = new THREE.BoxBufferGeometry(boxDimensions.width, boxDimensions.height, boxDimensions.depth);
const material = new THREE.MeshPhongMaterial({ specular: 1 });
const boxes = [];

const preCreateBoxes = (width, height, scene) => {
	for (let i = 0;i < width * height;i++) {
		const box = new THREE.Mesh(geometry, material.clone());
		box.castShadow = false;
		box.receiveShadow = false;
		boxes.push(box);
		scene.add(box);
	}
}

const drawMatrixOnScene = (matrix, scene) => {
	const height = matrix.length;
	const width = matrix[0].length;

	const startX = width * 0.5 * boxDimensions.width * -1;
	const startZ = height * 0.5 * boxDimensions.depth * -1;

	let i = 0;
	for (let y = 0;y < height;y++) {
		for (let x = 0;x < width;x++) {
			const value = matrix[y][x].toFixed(heightResolution);

			const box = boxes[i];
			box.material.color.setHSL(1, value, value);
			box.position.x = startX + x * boxDimensions.width;
			box.position.y = value * boxDimensions.height * 10;
			box.position.z = startZ + y * boxDimensions.depth;

			i++;
		}
	}
};

const generateAndDrawMatrix = (wasmExports, scene) => {
	// Should make the matrix in WASM but I don't understand enough of things
	const matrix = []; 
	for (let y = 0;y < height;y++) {
		if (typeof matrix[y] === 'undefined') matrix[y] = [];

		for (let x = 0;x < width;x++) {
			matrix[y][x] = wasmExports._perlin2d(x, y, 0.1, 4);
		}
	}	

	drawMatrixOnScene(matrix, scene);
};

export default () => {
	loadWebAssemblyModule({ 
		env: { 
			memoryBase: 0,
			memory,

			tableBase: 0,
			table,
		},
	})
	.then(module =>  {
		const exports = module.instance.exports;
		
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x222222);

		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.y = 800;
		camera.position.z = -1000;
		camera.position.x = -1000;

		const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.position.x = 50;
		dirLight.position.y = 50;
		scene.add(dirLight);

		const d = 50;
		dirLight.shadow.camera.left = -d;
		dirLight.shadow.camera.right = d;
		dirLight.shadow.camera.top = d;
		dirLight.shadow.camera.bottom = -d;
		dirLight.shadow.camera.far = 3500;
		dirLight.shadow.bias = -0.0001;

		const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
		hemiLight.color.setHSL(0.6, 1, 0.9);
		hemiLight.position.set(0, 50, 0);
		scene.add(hemiLight);
		
		const renderer = new THREE.WebGLRenderer();
		renderer.shadowMap.enabled = true;
		renderer.setSize(window.innerWidth, window.innerHeight);
		
		document.body.appendChild(renderer.domElement);
		
		window.addEventListener('resize', () => {
			renderer.setSize(window.innerWidth, window.innerHeight);

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		});
		
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableZoom = false;

		preCreateBoxes(width, height, scene);

		const animate = () => {
			// exports._setSeed(performance.now() / 500);
			// generateAndDrawMatrix(exports, scene);

			renderer.render(scene, camera);
			
			requestAnimationFrame(animate);
		};
		
		generateAndDrawMatrix(exports, scene);

		requestAnimationFrame(animate);
	});
};
