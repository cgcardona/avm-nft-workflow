# AVM NFT Workflow

Avalanche AVM nft workflow including calculating valid number of delegators/validators, creating the NFT asset with multiple NFT mint outputs per NFT groupID and minting NFTs.

## Getting Started

Clone the repo and install dependencies.

```zsh
git clone https://github.com/cgcardona/avm-nft-workflow.git
cd avm-nft-workflow/
yarn install
```

## Running Scripts

We're using [ts-node](https://github.com/TypeStrong/ts-node) run scripts while bypassing the ts -> js transpilation step.

### Calculate Validator and Delegator Counts

```zsh
yarn calculateValidatorAndDelegatorCounts
yarn run v1.22.10
$ ts-node scripts/calculateValidatorAndDelegatorCounts.ts
Validators count: 5
Blacklist count: 0
Whitelist count: 0
Total Validator and Whitelist count: 5
✨  Done in 1.86s.
```

### Create Asset Tx - NFT

```zsh
yarn createAssetTx-nft
yarn run v1.22.10
$ ts-node scripts/createAssetTx-nft.ts
Success! TXID: 2s5P6g9ErtTrkhyz8xmWnmSYtbUjzZMdBTWrheSXLnxkRakxNP
✨  Done in 2.26s.
```

### Operation Tx - Mint NFT

Replace the `jsonPayload` with your NFT payload before minting NFTs.

```ts
const jsonPayload: Payload = {
  avalanche: {
    version: 1,
    type: "generic",
    title: "Ascension or Descension",
    img: "https://i.imgur.com/WNvPiDl.jpg",
    desc: "Climbing higher or spiraling downward?"
  }
}
```

```zsh
yarn operationTx-mint-NFT
yarn run v1.22.10
$ ts-node scripts/operationTx-mint-NFT.ts
Success! TXID: gxK1HYyWzSRQTtPmQVntf4fGrz4FDVW7rBavbi2VvJkH2pdLp
✨  Done in 2.37s.
```

### Get AVM UTXOs

NFTs don't show up as regular token balances so you'll need to fetch the AVM UTXOs per an address periodically to confirm that everything is working as expected.

We're using [jq](https://stedolan.github.io/jq) for format JSON at the command line. Simply append ` | jq .` to the end of a `curl` request to get pretty JSON.

```zsh
curl --location --request POST 'http://avalanche.network.local:9650/ext/bc/X' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc":"2.0",
    "id"     :1,
    "method" :"avm.getUTXOs",
    "params" :{
        "addresses":["X-local18jma8ppw3nhx5r4ap8clazz0dps7rv5u00z96u"],
        "limit": 50,
        "sourceChain": "X"
    }
}'  | jq .

{
  "jsonrpc": "2.0",
  "result": {
    "numFetched": "7",
    "utxos": [
      "114i5gyxbzSG3k1yus6hyGv3ZmYMgnXj3oiWBsHisnVbiAxHysh3d1K1JPjF5XDWckCVNCUq9fTdabSuTQ2Pkg2fdRHCNNRwUefpkj1dQotM2va2f2xFQA6AqufsoruauXvvxTQKw8repp8LTVP4RXRXtPyqucEnCeLvNfRCMWfEoMwBsECGW8HDr22YetRB4ujqNKqhUznH4N6yahxSqaaTZFqrvCSENi2trz2C45aa4JuuPnTdEsz63c1yi5CrV91VmgRuvvLKkAePsJ5vPwb2Fj5ZYDdiGfg2PhoqYgSD7uWSCU1goqU1Qusak2gff8jvCKgXKKUN4RHqc3UH1ELNUCN3S4GSW3CnF9hwaBBwcLGjfJZ2bUMsDViqJKRvkJxB785yd",
      "116CVSJxRdan1FCV5vxD13zPWaxM279DjhZ3vJ3og4xVTYFdpSgPzAY5hyA79pCBQv35PyoiKSEhnxgHAStkMzPX7eig36fAnRt4cSTfTQ11KKkf32ES43d1YSuUu9hKcFqUbUFQ4VEFVhmqxwqR5wrg8qsPL2wxU",
      "116CVSJxRdan1FCV5vxD13zPWaxM279DjhZ3vJ3og4xVTYFdpSgMCNEeGo9uUUxXgw79CR2PfYFbh6yn5Wh7ir8VYHxRxxrd37t7JNHUyqP5ZQYzCWsZX5EKFhpAHvemMbdpz6dFQHKLXMwhi8NSwbRgqsipqJYpf",
      "116CVSJxRdan1FCV5vxD13zPWaxM279DjhZ3vJ3og4xVTYFdpSgJQZwCqd9ho9isxxBCzrF51eGVbFHGzaVV5hsTxwCBtq45Hot9zJ7JWGm9oVMKN1Wgz6qcxxiqghcD6wSBNj16k5QRZ27ZTJuUoEzhYuaJEoBZS",
      "116CVSJxRdan1FCV5vxD13zPWaxM279DjhZ3vJ3og4xVTYFdpSgFcmdmQT9W7pVEEyFGoHTkMkHPVPamueHrSZcSPaRwphFXYVtCgDw82i9E3a9eXW9pT8SvgDdX5UZerHEXmMNx5sVWagHRCVSWetZiFwRoULh8q",
      "116CVSJxRdan1FCV5vxD13zPWaxM279DjhZ3vJ3og4xVTYFdpSgCpyLKyH9JSVFaWzKLbigRhrJHPXtGpi6DoRMQpDfhkZSyoBtFN9kwZ9XJHewygznwvA4EPUYCUFX6bd2t9ykoRfabcLTGwfyYWY8ixyHJ3tRaM",
      "11b1r5LyVp7cWfu7fGqn42zUZtYdqEGqEZSmcezVhonCCPEzXoRVS5kzc6aQxqan1fXzVXdooN3bWtzbfaxC68wXdDgGof1MUZJ3zU4yCXuxQJ58xUqtTydZXRuvzHUD2ZKfrKiEHh5c8V7zoF7SBnw5BaC8M64oP2ytL3"
    ],
    "endIndex": {
      "address": "X-local18jma8ppw3nhx5r4ap8clazz0dps7rv5u00z96u",
      "utxo": "Mx6ecL15fpmyLs44i7bAbW8x4gtM9uoLaadLhSEFFUJd7x1He"
    },
    "encoding": "cb58"
  },
  "id": 1
}
```
