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

## Pour générer les types et les hooks de Wagmi

Aller dans le fichier `wagmi.config.ts`

```js
export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "Storage",
      abi: StoreContractAbi,
      address: StoreContractAddress,
    },
  ],
  plugins: [react()],
})
```

Lancer ensuite: `yarn wagmi generate`

Un exemple existe pour la contrat Storage.
Ici, on a a ajouté un nom (`Storage`), ainsi qu'un abi et une address, qu'on a stocké dans un fichier.

On a également ajouté le plugin react, qui va créer les hooks nécessaire pour lire et écrire dans ce contrat (et les autres qui viendront s'ajouter plus tard dans le fichier).

Donc pour le contrat, on aura par exemple useStorageRetrieve et useStorageStore, qui seront déjà configurés pour appeler les fonctions Solidity.