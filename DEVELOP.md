# Development

To get started, install the project dependencies with:

```bash
yarn install # or npm install
```

Run the electron project with:

```bash
yarn electron:serve # or npm run electron:serve
```

## Building and Publishing Instructions

You can only build the files from the respective OSs. Unless you own such systems, to deploy use a Docker container for Windows and a VM for Mac.

For new versions, bump up the version number in `package.json`.

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
yarn
yarn electron:generate-icons
yarn electron:publish -w # or yarn electron:build -w to build only
chown -R `stat -c "%u:%g" ./build` ./build  # change ownership of built files (e.g. icons) created in the Docker container
chown -R `stat -c "%u:%g" ./dist_electron` ./dist_electron  # change ownership of the dist files created in the Docker container
```

### MacOS

You need Virtualbox on your machine. Run the automated script you find at https://github.com/myspaghetti/macos-virtualbox to create a macOs VM.
Depending on the CPU you have, it might error and halt at some point, from which you will have to select a different cpu profile. For a Ryzen 5, this works:

```bash
VBoxManage modifyvm "macOS" --cpu-profile "Intel Xeon X5482 3.20GHz"
```

After the VM boots, continue the script.

To build, use:

```bash
yarn electron:generate-icons
yarn electron:publish -m # or yarn electron:build -m to build only
```

### Linux

In a linux environment, simply run:

```bash
yarn electron:generate-icons
yarn electron:publish -l # or yarn electron:build -l to build only
```
