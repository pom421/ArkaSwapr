## ArkaSwapr

Un protocole pour récompenser l'attention des utilisateurs sur des ressources Web3.

## Installation backend

### En local

```shell
yarn
cd backend
yarn hardhat node # pour lancer le noeud Ethereum
yarn hardhat run scripts/deployStorage --network localhost
```

## Pour lancer les tests

```shell
npx hardhat test
REPORT_GAS=true npx hardhat test
```

PS: le chainId de HardHat est 31337.


yarn create next-app --typescript