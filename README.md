## ArkaSwapr

Un protocole pour récompenser l'attention des utilisateurs sur des ressources Web3.

### Run en développement

```
npx hardhat node
cd backend
npx hardhat run scripts/deployArka --network localhost # récupérer l'adresse du contrat (et éventuellement, copier l'ABI si changement)
cd ../frontend
yarn wagmi generate
# modifier adresse du contrat + abi dans frontend/src/contracts/ArkaMaster.ts/
yarn dev
```

## Troubleshoot

1. Hardhat demande à ajouter des librairies supplémentaires et ethers n'est pas reconnu dans les imports.

Ces librairies ne sont pas nécessaires car elles sont importées via `@nomicfoundation/hardhat-toolbox` normalement.
Cela arrive quand on mélange l'utilisation de npx avec yarn. 

Solution 
- Toujours utiliser npx pour la partie backend.
- Toujours utiliser yarn pour la partie frontend.

2. Problème dans les logs d'ethers. Nonce pas cohérent.

C'est un problème du wallet. Aller dans MetaMask > Paramètres avancés > Réinitialiser le compte.



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

### FAQ

`Comment voir le nombre d'ARKA possédés ?`

Copier l'adresse du contrat ArkaERC20.
Aller dans MetaMask, actifs > importer des jetons et copier l'adresse du contrat.