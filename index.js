const Nimiq = require('./core/dist/node.js');
const si = require('systeminformation');

var cpuData = {}, osData = {};

function runSysInfo() {
    si.cpu(function(_cpuData) {
        cpuData = _cpuData;
        si.osInfo(function(_osData) {
            osData = _osData;
            runNimiq(cpuData.cores)
        });
    });
}

function runNimiq(cores) {
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
        $.miner.threads = cores;
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
                const account = await $.accounts.get($.wallet.address);
                const sum = hashrates.reduce((acc, val) => acc + val, 0);
                $.miner.stopWork()
                const _hashAverage = (sum / hashrates.length).toFixed(Math.log10(hashrates.length)).padStart(7);
                const benchmarkData = {
                    hashAverage: _hashAverage,
                    cpu: {
                        manufacturer: cpuData.manufacturer,
                        brand: cpuData.brand,
                        cores: cpuData.cores
                    },
                    os: {
                        platform: osData.platform,
                        distro: osData.distro,
                        release: osData.release,
                        kernel: osData.kernel,
                        arch: osData.arch,

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