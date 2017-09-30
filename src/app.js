import loadWebAssemblyModule from 'wasm/perlinNoise.wasm';

export const memory = new WebAssembly.Memory({ initial: 256 });
export const table = new WebAssembly.Table({ initial: 0, element: 'anyfunc' });

export const heapU8 = new Uint8Array(memory.buffer);

const resolution = 1; // Amount of decimals
const width = 200;
const height = 200;

const drawMatrixOnContext = (matrix, context) => {
	const height = matrix.length;
	const width = matrix[0].length;

	for (let y = 0;y < height;y++) {
		for (let x = 0;x < width;x++) {
			const value = matrix[y][x].toFixed(resolution);
			const rgb = 255 * value << 0;

			context.fillStyle = `rgb(${rgb}, ${rgb}, ${rgb})`;
			context.fillRect(x, y, 1, 1);
		}
	}
};

const generateAndDrawMatrix = (wasmExports, context) => {
	// Should make the matrix in WASM but I don't understand enough of things
	const matrix = []; 
	for (let y = 0;y < height;y++) {
		if (typeof matrix[y] === 'undefined') matrix[y] = [];

		for (let x = 0;x < width;x++) {
			matrix[y][x] = wasmExports._perlin2d(x, y, 0.1, 4);
		}
	}	

	drawMatrixOnContext(matrix, context);
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
		
		const canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
	
		canvas.width = width;
		canvas.height = height;
	
		const context = canvas.getContext('2d');

		const animate = () => {
			exports._setSeed(performance.now() / 50);

			generateAndDrawMatrix(exports, context);
	
			requestAnimationFrame(animate);
		};

		requestAnimationFrame(animate);
	});
};
