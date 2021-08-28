import { Avalanche, BinTools, BN, Buffer } from "avalanche"
import {
  AVMAPI,
  SECPTransferOutput,
  SECPTransferInput,
  TransferableOutput,
  TransferableInput,
  UTXOSet,
  UTXO,
  AmountOutput,
  UnsignedTx,
  AVMConstants,
  OperationTx,
  TransferableOperation,
  Tx,
  KeyChain,
  NFTMintOperation,
  NFTMintOutput
} from "avalanche/dist/apis/avm"
import { OutputOwners } from "avalanche/dist/common"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults
} from "avalanche/dist/utils"

const getUTXOIDs = (
  utxoSet: UTXOSet,
  txid: string,
  outputType: number = AVMConstants.SECPXFEROUTPUTID_CODECONE,
  assetID = ""
): string[] => {
  const utxoids: string[] = utxoSet.getUTXOIDs()
  let result: string[] = []
  for (let index: number = 0; index < utxoids.length; ++index) {
    if (
      utxoids[index].indexOf(txid.slice(0, 10)) != -1 &&
      utxoSet.getUTXO(utxoids[index]).getOutput().getOutputID() == outputType &&
      assetID ==
      bintools.cb58Encode(utxoSet.getUTXO(utxoids[index]).getAssetID())
    ) {
      result.push(utxoids[index])
    }
  }
  return result
}

interface EndIndex {
  address: string
  utxo: string
}

interface AVMResponse {
  numFetched: number
  utxos: UTXOSet
  endIndex: EndIndex
}

// local network
const ip: string = "localhost"
const port: number = 9650
const protocol: string = "http"
const networkID: number = 12345

// fuji
// const ip: string = "api.avax-test.network"
// const port: number = 443
// const protocol: string = "https"
// const networkID: number = 2

// mainnet
// const ip: string = "api.avax.network"
// const port: number = 443
// const protocol: string = "https"
// const networkID: number = 1

const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID)
const xchain: AVMAPI = avalanche.XChain()
const bintools: BinTools = BinTools.getInstance()
const xKeychain: KeyChain = xchain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
xKeychain.importKey(privKey)
const xAddresses: Buffer[] = xchain.keyChain().getAddresses()
const xAddressStrings: string[] = xchain.keyChain().getAddressStrings()
const blockchainID: string = Defaults.network[networkID].X.blockchainID
const avaxAssetID: string = Defaults.network[networkID].X.avaxAssetID
const avaxAssetIDBuf: Buffer = bintools.cb58Decode(avaxAssetID)
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const operations: TransferableOperation[] = []
const fee: BN = xchain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from("AVM manual OperationTx to mint an NFT")
const jsonPayload = {
  avalanche: {
    version: 1,
    type: "generic",
    title: "Ascension or Descension",
    img: "https://i.imgur.com/WNvPiDl.jpg",
    desc: "Climbing higher or spiraling downward?"
  }
}
const stringPayload: string = JSON.stringify(jsonPayload)
const payload: Buffer = Buffer.from(stringPayload)
const groupID: number = 0
// Uncomment for codecID 00 01
// const codecID: number = 1

const main = async (): Promise<any> => {
  const avmUTXOResponse: AVMResponse = await xchain.getUTXOs(xAddressStrings)
  const utxoSet: UTXOSet = avmUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO): void => {
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()
    const assetID: Buffer = utxo.getAssetID()
    if (
      utxo.getOutput().getTypeID() != 10 &&
      utxo.getOutput().getTypeID() != 11
    ) {
      const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
      const amt: BN = amountOutput.getAmount().clone()

      if (assetID.toString("hex") === avaxAssetIDBuf.toString("hex")) {
        const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
          amt.sub(fee),
          xAddresses,
          locktime,
          threshold
        )
        // Uncomment for codecID 00 01
        // secpTransferOutput.setCodecID(codecID)
        const transferableOutput: TransferableOutput = new TransferableOutput(
          avaxAssetIDBuf,
          secpTransferOutput
        )
        outputs.push(transferableOutput)

        const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
        // Uncomment for codecID 00 01
        // secpTransferInput.setCodecID(codecID)
        secpTransferInput.addSignatureIdx(0, xAddresses[0])
        const input: TransferableInput = new TransferableInput(
          txid,
          outputidx,
          avaxAssetIDBuf,
          secpTransferInput
        )
        inputs.push(input)
      } else {
        const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
          amt,
          xAddresses,
          locktime,
          threshold
        )
        // Uncomment for codecID 00 01
        // secpTransferOutput.setCodecID(codecID)
        const transferableOutput: TransferableOutput = new TransferableOutput(
          assetID,
          secpTransferOutput
        )
        outputs.push(transferableOutput)

        const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
        // Uncomment for codecID 00 01
        // secpTransferInput.setCodecID(codecID)
        secpTransferInput.addSignatureIdx(0, xAddresses[0])
        const input: TransferableInput = new TransferableInput(
          txid,
          outputidx,
          assetID,
          secpTransferInput
        )
        inputs.push(input)
      }
    } else if (
      utxo.getOutput().getTypeID() != 7 &&
      utxo.getOutput().getTypeID() != 11
    ) {
      const outputOwners: OutputOwners = new OutputOwners(
        xAddresses,
        locktime,
        threshold
      )
      const nftMintOutputUTXOIDs: string[] = getUTXOIDs(
        utxoSet,
        bintools.cb58Encode(txid),
        AVMConstants.NFTMINTOUTPUTID,
        bintools.cb58Encode(assetID)
      )
      const mintOwner: NFTMintOutput = utxo.getOutput() as NFTMintOutput
      // Uncomment for codecID 00 01
      //   mintOwner.setCodecID(codecID)
      const nftMintOperation: NFTMintOperation = new NFTMintOperation(
        groupID,
        payload,
        [outputOwners]
      )
      //   Uncomment for codecID 00 01
      //   nftMintOperation.setCodecID(codecID)
      const spenders: Buffer[] = mintOwner.getSpenders(xAddresses)
      const nftMintOutputUTXOID: string = utxo.getUTXOID()
      if (nftMintOutputUTXOID === nftMintOutputUTXOIDs[0]) {
        spenders.forEach((spender: Buffer) => {
          const idx: number = mintOwner.getAddressIdx(spender)
          nftMintOperation.addSignatureIdx(idx, spender)
        })

        const transferableOperation: TransferableOperation =
          new TransferableOperation(
            utxo.getAssetID(),
            [nftMintOutputUTXOID],
            nftMintOperation
          )
        operations.push(transferableOperation)
      }
    }
  })
  const operationTx: OperationTx = new OperationTx(
    networkID,
    bintools.cb58Decode(blockchainID),
    outputs,
    inputs,
    memo,
    operations
  )
  // Uncomment for codecID 00 01
  //   operationTx.setCodecID(codecID)

  const unsignedTx: UnsignedTx = new UnsignedTx(operationTx)
  const tx: Tx = unsignedTx.sign(xKeychain)
  const txid: string = await xchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
