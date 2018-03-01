# Nimiq Mining Benchmark
An automated mining benchmark for mining Nimiq

## Quickstart

1. Install [Node.js](https://nodejs.org) v8.0.0 or higher.
2. On Ubuntu, install `git` and `build-essential`: `sudo apt-get install -y git build-essential`.
    - On other Linux systems, install `git`, `python2.7`, `make` and `gcc`.
    - For MacOS or Windows, [check here for git](https://git-scm.com/downloads) and [here for compilation tools](https://github.com/nodejs/node-gyp#on-mac-os-x).
3. If you want to use `yarn` to manage the dependencies, run: `sudo npm install -g yarn`.
4. Install `gulp` globally: `sudo npm install -g gulp` or `yarn global add gulp`.
5. Clone this repository: `git clone --recursive https://github.com/bradrisse/nimiq-mining-benchmark.git`.
6. Enter the directory: `cd nimiq-mining-benchmark`.
7. Run: `npm install` or `yarn`.
8. Run: `npm run start` or `yarn start`.

** For linux you may need to run with sudo (`sudo yarn start`)


## Sample Output

Should take less than a minute to see final result.

```
{ 
  hashRate: {
    average: 4833,
    min: 4092,
    max: 5265
  },
  system: {
    manufacturer: 'Apple Inc.',
    model: 'MacBookPro11,4',
    version: '1.0'
  },
  cpu: {
    manufacturer: 'Intel®',
    brand: 'Core™ i7-4770HQ',
    cores: 8,
    speed: 2.2,
    speedMax: 2.2
  },
  os: {
    platform: 'darwin',
    distro: 'Mac OS X',
    release: '10.12.6',
    kernel: '16.7.0',
    arch: 'x64'
  },
  ram: { 
    type: 'DDR3',
    total: '16 GB',
    clockSpeed: 1600
  },
  estimatedHashRates: {
    node: 16.72,
    firefox: 6.86,
    chrome: 4.58
  }
}
```


## HashRate Estimations

The estimated hash rates are based on previously tested setups and use a very rough slope calculation. The more benchmarks received, the better these will become. 


## Common Issues

1. Error: Cannot find module ...... nimiq_node
    
    Fix: `cd core && sudo rm -rf node_modules && yarn && yarn build`
