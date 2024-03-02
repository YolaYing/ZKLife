/* eslint-disable no-console */
import * as zkgapi from '@hyperoracle/zkgraph-api'
import * as fs from 'node:fs'
import { ethers } from 'ethers'

interface NetworksConfig {
mainnet?: any // Optional
sepolia?: any // Optional
goerli?: any // Optional
}

const config = {
    JsonRpcProviderUrl: { // Erigon node rpc are highly recommended here.
      mainnet: 'https://eth.llamarpc.com',
      sepolia: 'https://eth-sepolia.public.blastapi.io',
    },
    UserPrivateKey: '0x{key}',
  }

const execOptionsForEvent = {
  wasmPath: __dirname + '/zkgraph_full.wasm',
  yamlPath: __dirname + '/zkgraph.yaml',
  local: false,
}

function loadConfigByNetwork(yaml: zkgapi.ZkGraphYaml, networksConfig: NetworksConfig, isDataSource: boolean) {
    let network: string | undefined
    if (yaml.dataSources?.[0].kind !== 'ethereum')
      throw new Error('loadConfigByNetwork only support ethereum right now.')
  
    // For exec and prove, we need to load the data source network
    if (isDataSource)
      network = yaml.dataSources?.[0].network
  
    // For publish & verify, we need to load the data destination network
    else
      network = yaml.dataDestinations?.[0].network
  
    // TODO: move health check
    if (!network) {
      throw new Error(
        `Network of "${isDataSource ? 'dataSource' : 'dataDestination'}" is not defined in yaml.`,
      )
    }
  
    // Check if the network is defined in constants.
    // const targetNetwork = getTargetNetwork(network)?.name.toLowerCase()
    // let targetConfig = ''
    // if (targetNetwork) {
    const targetConfig = networksConfig ? (networksConfig as any)[network] : undefined
    // }
  
    if (!targetConfig) {
      throw new Error(
        `[-] networksConfig for network "${network}" is not found in zkgraph-api.`,
      )
    }
  
    return targetConfig
  }

export async function Exec(execBlockid: number) {
    const { wasmPath, yamlPath, local } = execOptionsForEvent

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath) as zkgapi.ZkGraphYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
        provider,
        // blockId: loadConfigByNetwork(yaml, blocknumForStorageTest, true), // for storage
        blockId: execBlockid, // for event
    }

    const execParams = dsp?.toExecParams(generalParams)

    const state = await zkgapi.execute(
      { wasmUint8Array, zkgraphYaml: yaml },
      execParams as any,
      local,
      true,
    )

    return state
}
