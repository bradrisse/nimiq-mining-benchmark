const Nimiq = require('./core/dist/node.js');
const si = require('systeminformation');


function runSysInfo() {
    si.getStaticData(function(_compData) {
        runNimiq(_compData)
    });
}

function runNimiq(_compData) {
    const $ = {};
    const TAG = 'Node';

    (async () => {
        const networkConfig = new Nimiq.DumbNetworkConfig();

        $.consensus = await Nimiq.Consensus.light(networkConfig);

        $.blockchain = $.consensus.blockchain;
        $.accounts = $.blockchain.accounts;
        $.mempool = $.consensus.mempool;
        $.network = $.consensus.network;


        // TODO: Wallet key.
        $.walletStore = await new Nimiq.WalletStore();
        $.wallet = await $.walletStore.getDefault();

        $.miner = new Nimiq.Miner($.blockchain, $.accounts, $.mempool, $.network.time, $.wallet.address);

        $.blockchain.on('head-changed', (head) => {
            if ($.consensus.established || head.height % 100 === 0) {
                Nimiq.Log.i(TAG, `Now at block: ${head.height}`);
            }
        });

        $.network.on('peer-joined', (peer) => {
            Nimiq.Log.i(TAG, `Connected to ${peer.peerAddress.toString()}`);
        });

        $.network.connect();

        $.consensus.on('established', () => $.miner.startWork());
        $.consensus.on('lost', () => $.miner.stopWork());
        $.miner.threads = _compData.cpu.cores;
        $.miner.startWork();

        $.consensus.on('established', () => {
            Nimiq.Log.i(TAG, `Blockchain ${type}-consensus established in ${(Date.now() - START) / 1000}s.`);
            Nimiq.Log.i(TAG, `Current state: height=${$.blockchain.height}, totalWork=${$.blockchain.totalWork}, headHash=${$.blockchain.headHash.toBase64()}`);
        });

        const hashrates = [];
        const outputInterval = typeof statisticsOptions === 'number' ? statisticsOptions : 30; // seconds

        $.miner.on('hashrate-changed', async (hashrate) => {
            hashrates.push(hashrate);

            if (hashrates.length >= outputInterval) {
                const sum = hashrates.reduce((acc, val) => acc + val, 0);
                $.miner.stopWork()
                const _hashAverage = (sum / hashrates.length).toFixed(Math.log10(hashrates.length)).padStart(7);
                const benchmarkData = {
                    hashRate: {
                        average: _hashAverage,
                        // min: Math.min(hashrates),
                        // max: Math.max(hashrates)
                    },
                    system: {
                        manufacturer: _compData.system.manufacturer,
                        model: _compData.system.model,
                        version: _compData.system.version,
                    },
                    cpu: {
                        manufacturer: _compData.cpu.manufacturer,
                        brand: _compData.cpu.brand,
                        cores: _compData.cpu.cores
                    },
                    os: {
                        platform: _compData.os.platform,
                        distro: _compData.os.distro,
                        release: _compData.os.release,
                        kernel: _compData.os.kernel,
                        arch: _compData.os.arch
                    }

                }
                console.log('benchmarkData ', benchmarkData)

                //TODO: Send to benchmark server
                hashrates.length = 0;
                process.exit(0);
            }
        });

    })().catch(e => {
        console.error(e);
        process.exit(1);
    });
}

runSysInfo()