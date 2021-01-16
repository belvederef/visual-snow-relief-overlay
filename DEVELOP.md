# Development instructions

### Windows

To build the package for Windows:

```bash
docker run --rm -ti \
  --env ELECTRON_CACHE="/root/.cache/electron" \
  --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
  -v ${PWD}:/project \
  -v ${PWD##*/}-node-modules:/project/node_modules \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/builder:wine
```

Once inside the container:

```bash
yarn electron:build -w
```

### MacOs

You need Virtualbox on your machine. Run the automated script you find at https://github.com/myspaghetti/macos-virtualbox to create a macOs VM.
Depending on the CPU you have, it might error and halt at some point, from which you will have to select a different cpu profile. For Ryzen 5, this works:

```bash
VBoxManage modifyvm "macOS" --cpu-profile "Intel Xeon X5482 3.20GHz"
```

After the VM boots, continue the script.

To build, use:

```bash
yarn electron:build -m
```

### Linux

In a linux environment, simply run:

```bash
yarn electron:build -l
```
