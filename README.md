## ArkaSwapr

Un protocole pour récompenser l'attention des utilisateurs sur des ressources.

La stack technique repose sur hardhat, côté backend et Next.js côté front (via `npx create next-app --typescript`), avec wagmi/ethers.js et Chakra UI.

## Démo sur Sepolia

https://arka-swapr.vercel.app/

### Workflow en développement

```shell
npx hardhat node
cd backend
npx hardhat run scripts/deployArka --network localhost # récupérer l'adresse du contrat (et éventuellement, copier l'ABI si changement)
cd ../frontend

# modifier adresse du contrat + abi dans frontend/src/contracts/ArkaMaster.ts/

yarn dev # va lancer `yarn wagmi generate` préalablement (cf. package.json)
```
## Mémo CLI hardhat

```shell
npx hardhat help # aide 
npx hardhat test # lancer les tests en local
REPORT_GAS=true npx hardhat test  # lancer les tests avec résumé sur le coût en gas
npx hardhat node # Lancer un client Ethereum en local. Possibilité de forker le mainnet (cf. hardhat.config.ts)
npx hardhat run scripts/deploy.ts # Lancer un script de déploiement qui va déployer des smart contracts
npx hardhat run scripts/deploy.ts --network sepolia # Déploiement sur sepolia
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

## Lancer la couverture des tests**

`npx hardhat coverage`

<details>
<summary>Couverture au 7 avril 2023</summary>
<pre>
----------------------|----------|----------|----------|----------|----------------|
File                  |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------------------|----------|----------|----------|----------|----------------|
 contracts/           |    37.74 |    25.93 |    48.15 |    34.18 |                |
  ArkaERC20.sol       |      100 |       75 |      100 |      100 |                |
  ArkaMaster.sol      |    52.63 |    27.78 |    66.67 |    54.17 |... 199,200,202 |
  ArkaStaking.sol     |        0 |        0 |        0 |        0 |... 168,169,171 |
  ChainlinkEthUsd.sol |      100 |      100 |      100 |      100 |                |
  Lock.sol            |      100 |      100 |      100 |      100 |                |
  Storage.sol         |        0 |      100 |        0 |        0 |       21,23,31 |
----------------------|----------|----------|----------|----------|----------------|
All files             |    37.74 |    25.93 |    48.15 |    34.18 |                |
----------------------|----------|----------|----------|----------|----------------|
</pre>
</details>

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
    // Ajouter ses contrats, avec leur abi et leur adresses.
  ],
  plugins: [react()],
})
```

Lancer ensuite: `yarn wagmi generate`.

Un exemple existe pour la contrat Storage.
Ici, on a a ajouté un nom (`Storage`), ainsi qu'un abi et une address, qu'on a stocké dans un fichier.

On a également ajouté le plugin react, qui va créer les hooks nécessaire pour lire et écrire dans ce contrat (et les autres qui viendront s'ajouter plus tard dans le fichier).

Donc pour le contrat, on aura par exemple useStorageRetrieve et useStorageStore, qui seront déjà configurés pour appeler les fonctions Solidity.

### FAQ

**Quel est le chain id de Hardhat ?**

Le chainId de HardHat est 31337.

**Comment voir le nombre d'ARKA possédés ?**

Copier l'adresse du contrat ArkaERC20.
Aller dans MetaMask, actifs > importer des jetons et copier l'adresse du contrat.

**Hardhat demande à ajouter des librairies supplémentaires et ethers n'est pas reconnu dans les imports.**

Ces librairies ne sont pas nécessaires car elles sont importées via `@nomicfoundation/hardhat-toolbox` normalement.
Cela arrive quand on mélange l'utilisation de npx avec yarn. 

Solution 
- Toujours utiliser npx pour la partie backend.
- Toujours utiliser yarn pour la partie frontend.

**Problème dans les logs d'ethers. Nonce pas cohérent.**

C'est un problème du wallet. Aller dans MetaMask > Paramètres avancés > Réinitialiser le compte.
