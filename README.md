# NodeDAO-Oracle

Made by:  [kinghash](https://www.kinghash.com/)

![kinghash](./docs/images/kingHashLogo.PNG)

**NodeDAO Oracle daemon**

Oracle daemon for NodeDAO decentralized staking service. Collects and reports Beacon Chain states (the number of visible validators and their summarized balances) to the NodeDAO dApp contract running on Ethereum execution layer.

For oracle contracts, see: [NodeDAO/NodeDAO-Protocol](https://github.com/NodeDAO/NodeDAO-Protocol)



## Working Mechanism

- Upon the start daemon determines the reportable epoch and retrieves the list of validator keys to watch for.
- Then it Gets the NodeDAO-controlled validators from the reportable beacon state and summarizes their balances.
- Constructs the transaction containing the `epochId`, `beaconBalance`, `beaconValidators`  and `validatorRankingRoot`.
- If the daemon has `privateKey` in config file, it signs and sends the transaction to the oracle contract.



## Config File

config-default.json

```json
{
  "log": {
    "level": "info"
  },
  "network": "goerli",
  "beaconNodeAddr": "",
  "executionLayerAddr": "",
  "privateKey": ""
}
```

> Only json file format is supported



### Configuration details

| Attribute          | Required | Default | Description                                                  |
| ------------------ | -------- | ------- | ------------------------------------------------------------ |
| log.level          | false    | info    | log level                                                    |
| network            | false    | mainnet | network                                                      |
| beaconNodeAddr     | true     |         | Endpoint of beacon chain connection                          |
| executionLayerAddr | true     |         | Endpoint of layer connection                                 |
| privateKey         | true     |         | Oracle member's private key（Make enough ETH to support the GAS of transactions） |



### Note:

- Ensure connectivity between the ETH execution layer and the ETH consensus layer nodes for which the `executionLayerAddr` and `beaconNodeAddr` parameters are set.
- Ensure that privateKey's private key is authorized by Oracle-Dao.



## Setup

### Quick Commands
Make sure you already have node and npm environments

```sh
yarn install
yarn run dev --config <config_file_path>
yarn run build
yarn run build-all
yarn run start --config <config_file_path>
```

### Docker

[NodeDAO-Oracle docker images](https://hub.docker.com/r/kinghash/nodedao-oracle/tags)

```sh
docker pull kinghash/nodedao-oracle:latest
docker run -v `pwd`/src/config/config-dev.json:/config/config-dev.json -d  kinghash/nodedao-oracle:latest --config  /config/config-dev.json
```



# License

2022 kinghash

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the [GNU General Public License](https://github.com/lidofinance/lido-oracle/blob/develop/LICENSE) along with this program. If not, see https://www.gnu.org/licenses/.
