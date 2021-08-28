import { Avalanche, BN } from "avalanche"
import { PlatformVMAPI } from "avalanche/dist/apis/platformvm"
import { ONEAVAX } from "avalanche/dist/utils"

interface GetCurrentValidatorsResponse {
  validators: Validator[]
}

interface Validator {
  txID: string
  startTime: string
  endTime: string
  stakeAmount: string
  nodeID: string
  rewardOwner: {
    locktime: string
    threshold: string
    addresses: string[]
  },
  potentialReward: string
  delegationFee: string
  uptime: string
  connected: boolean
  delegators: Delegator[]
}

interface Delegator {
  txID: string
  startTime: string
  endTime: string
  stakeAmount: string
  nodeID: string
  rewardOwner: RewardOwner[]
  potentialReward: string
}

interface RewardOwner {
  locktime: string
  threshold: string
  addresses: string[]
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
const pchain: PlatformVMAPI = avalanche.PChain()
const minDelegatorStake: BN = ONEAVAX.mul(new BN(25))
// 25000000000

const main = async (): Promise<any> => {
  let numValidators: number = 0
  let numBlacklist: number = 0
  let numWhitelist: number = 0
  const currentValidators = await pchain.getCurrentValidators() as GetCurrentValidatorsResponse
  currentValidators.validators.forEach((validator: Validator) => {
    numValidators += 1
    if (validator.delegators) {
      validator.delegators.forEach((delegator: Delegator) => {
        if (delegator.stakeAmount === minDelegatorStake.toString()) {
          numBlacklist += 1
        } else {
          numWhitelist += 1
        }
      })
    }
  })
  console.log(`Validators count: ${numValidators}`)
  console.log(`Blacklist count: ${numBlacklist}`)
  console.log(`Whitelist count: ${numWhitelist}`)
  console.log(`Total Validator and Whitelist count: ${numValidators + numWhitelist}`)

  // Example output
  // ts-node examples/platformvm/calculateValidatorAndDelegatorCount.ts
  // Validators count: 1037
  // Blacklist count: 2540
  // Whitelist count: 13345
  // Total Validator and Whitelist count: 14382
}

main()
