## ArkaSwapr

Un protocole pour récompenser l'attention des utilisateurs sur des ressources Web3.

## Troubleshoot

Problème avec hardhat si on mélange l'utilisation de yarn et npm/npx.
Toujours utiliser npx pour la partie backend.
Toujours utiliser yarn pour la partie frontend.

## Mémo CLI hardhat

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
### Lancement en local

```shell
❯ cd backend
❯ npm install
❯ npx hardhat node # pour lancer le noeud Ethereum
❯ npx hardhat run scripts/deployStorage --network localhost
```

PS: si on ne met pas l'option `--network`, il va lancer le script sur une instance de hardhat node en mémoire, donc pas accessible ensuite en Remix p. ex. Donc toujours mettre renseigner cette option.

### Déploiement sur Sepolia

```shell
❯ npx hardhat run scripts/deployArka.ts --network sepolia
```

## Pour lancer les tests

```shell
❯ npx hardhat test
❯ REPORT_GAS=true npx hardhat test
```

PS: le chainId de HardHat est 31337.


npx create next-app --typescript

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

Lancer ensuite: `yarn wagmi generate` # à tester: auparavant, j'utilisais yarn

Un exemple existe pour la contrat Storage.
Ici, on a a ajouté un nom (`Storage`), ainsi qu'un abi et une address, qu'on a stocké dans un fichier.

On a également ajouté le plugin react, qui va créer les hooks nécessaire pour lire et écrire dans ce contrat (et les autres qui viendront s'ajouter plus tard dans le fichier).

Donc pour le contrat, on aura par exemple useStorageRetrieve et useStorageStore, qui seront déjà configurés pour appeler les fonctions Solidity.