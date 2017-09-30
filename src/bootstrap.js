import app from 'app';

if (!window.WebAssembly) {
	throw new Error('Sorry, your browser does not support WebAssembly');
}

app();