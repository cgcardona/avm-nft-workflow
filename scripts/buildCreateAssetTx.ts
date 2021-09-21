// this code is explained in detail in https://docs.avax.network/build/tools/avalanchejs/create-an-asset-on-the-x-chain 


import { Avalanche, BN, Buffer } from "avalanche"
import {
  AVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx,
  InitialStates,
  SECPMintOutput,
  SECPTransferOutput
} from "avalanche/dist/apis/avm"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey
} from "avalanche/dist/utils"

const ip: string = "localhost"
const port: number = 9650
const protocol: string = "http"
const networkID: number = 12345
const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID)

const xchain: AVMAPI = avalanche.XChain()
const xKeychain: KeyChain = xchain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
xKeychain.importKey(privKey)
const xAddresses: Buffer[] = xchain.keyChain().getAddresses()
const xAddressStrings: string[] = xchain.keyChain().getAddressStrings()

const outputs: SECPMintOutput[] = []
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "AVM utility method buildCreateAssetTx to create an ANT"
)
const name: string = "TestToken"
const symbol: string = "TEST"
// Where is the decimal point indicate what 1 asset is and where fractional assets begin
// Ex: 1 AVAX has denomination of 9, so the smallest unit of AVAX is nanoAVAX (nAVAX) at 10^-9 AVAX
const denomination: number = 3

const main = async (): Promise<any> => {
  const avmUTXOResponse: any = await xchain.getUTXOs(xAddressStrings)
  const utxoSet: UTXOSet = avmUTXOResponse.utxos

  // Create outputs for the asset's initial state
  const amount: BN = new BN(507)
  const vcapSecpOutput: SECPTransferOutput  = new SECPTransferOutput(
    amount,
    xAddresses,
    locktime,
    threshold
  )
  const initialStates: InitialStates = new InitialStates()

  // Populate the initialStates with the outputs
  initialStates.addOutput(vcapSecpOutput)

  const secpMintOutput: SECPMintOutput = new SECPMintOutput(
    xAddresses,
    locktime,
    threshold
  )
  outputs.push(secpMintOutput)

  const unsignedTx: UnsignedTx = await xchain.buildCreateAssetTx(
    utxoSet,
    xAddressStrings,
    xAddressStrings,
    initialStates,
    name,
    symbol,
    denomination,
    outputs,
    memo
  )
  const tx: Tx = unsignedTx.sign(xKeychain)
  const txid: string = await xchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)

  const status: string = await xchain.getTxStatus(txid)
  console.log(`status: ${status}`)

  // adjust the timeout value so that different states will be printed out: 
  // "Processing", "Accepted", "Unknown", "Rejected"
  setTimeout(async () => {
    const status: string = await xchain.getTxStatus(txid)
    console.log(`status: ${status}`)
  }, 2000);

}

main()
