function compile {
	rm -rf wasm
	mkdir -p wasm

	for filename in c/*.c; do
		wasm=${filename##*/}
		wasm=${wasm%.c}
		wasm="wasm/$wasm.wasm"

		emcc $filename \
			-O3 \
			-o $wasm \
			-s WASM=1 \
			-s SIDE_MODULE=1

		echo "$wasm compiled"
	done
}

# Watch for changes
chsum1=""

while [[ true ]]
do
	chsum2=`find c/ -type f -exec md5 {} \;`
	if [[ $chsum1 != $chsum2 ]] ; then      
		echo "Compiling c to WASM"     
		compile
		chsum1=$chsum2
	fi
	sleep 2
done