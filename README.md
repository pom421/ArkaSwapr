## ArkaSwapr

Un protocole pour récompenser l'attention des utilisateurs sur des ressources.

La stack technique repose sur hardhat, côté backend et Next.js côté front (via `npx create next-app --typescript`), avec wagmi/ethers.js et Chakra UI.

<img width="1493" alt="image" src="https://user-images.githubusercontent.com/3749428/230745140-6a953d40-3778-4406-92cc-0036ee82adbe.png">

### Démo sur Sepolia

https://arka-swapr.vercel.app/

### Smart contracts sur Sepolia 

<pre>
Oracle deployed to 0x8b8D5e6D236831EE48f7CfCc68AF1A9D7648F339
ArkaERC20 deployed to 0x5Ccd9eDb23ABCE0ef87E0B17BB378bcAc9DF8B48
ArkaMaster deployed to 0x5BBD3AB995f4D37B0cEBB59e0b22e336576fABc9
</pre>

### Déploiement sur Sepolia

```shell
# Auparavant, changer dans scripts/deploytArka.ts l'adresse de ChainLink ! En local, on veut celui de mainnet. 
❯ npx hardhat run scripts/deployArka.ts --network sepolia
```

<details>
<summary>

#### Vérification `etherscan`

</summary>

<pre>
❯ npx hardhat verify --network sepolia 0x5BBD3AB995f4D37B0cEBB59e0b22e336576fABc9 

"0x5Ccd9eDb23ABCE0ef87E0B17BB378bcAc9DF8B48" "0x8b8D5e6D236831EE48f7CfCc68AF1A9D7648F339"
INFURA_ID edac3c26035f400981d2634401b83dcd
Nothing to compile
No need to generate any newer typings.
Successfully submitted source code for contract
contracts/ArkaMaster.sol:ArkaMaster at 0x5BBD3AB995f4D37B0cEBB59e0b22e336576fABc9
for verification on the block explorer. Waiting for verification result...

Successfully verified contract ArkaMaster on Etherscan.
https://sepolia.etherscan.io/address/0x5BBD3AB995f4D37B0cEBB59e0b22e336576fABc9#code
</pre>

</details>

### Tests

```shell
❯ npx hardhat test
❯ REPORT_GAS=true npx hardhat test # avec rapport sur le coût en gas
❯ npx hardhat coverage # lancer le rapport de couverture de tests
```

<details>
<summary>

#### Résulat des tests au 8 avril 2023

</summary>

<pre>
❯ REPORT_GAS=true npx hardhat test

  ArkaERC20
    ✔ sets correctly the address of ArkaMaster, test storage (1857ms)
    ✔ sets incorrectly the arkaMaster's address but he is not owner, test revert
    ✔ has the right initial supply, test storage

  ArkaMaster
    Oracle tests
      ✔ gets a non 0 result for EHT USD price, test integration chain link (436ms)
    ArkaMaster.proposeResource
      ✔ proposes correctly a resource, test storage
      ✔ proposes correctly a resource, test event
      ✔ proposes incorrectly a resource with a lower price than asked, test revert
    ArkaMaster.interact
      ✔ interacts correctly with a resource, test storage
      ✔ interacts correctly with a resource, test event (47ms)
      ✔ interacts correctly with a resource, test mint
      ✔ interacts incorrectly with a resource because already have interaction, test require
    ArkaMaster.startNewContract
      ✔ starts correctly a contract, test storage (154ms)
      ✔ starts correctly a contract, test event
      ✔ starts incorrectly a contract bc previous stake exists, test require
      ✔ starts incorrectly a contract bc amount is 0, test require
      ✔ starts incorrectly a contract bc amount is 0, test require
    ArkaMaster.endNewContract
      ✔ ends correctly a contract, test storage (64ms)
      ✔ ends correctly a contract, test storage on currentStake reference
      ✔ ends correctly a contract, test event
      ✔ ends incorrectly a contract bc a current is already here, test require
      ✔ ends incorrectly a contract bc the current stake is not finished, test require

  ArkaStaking
    ArkaStaking.deposit
      ✔ deposits incorrectly with zero ARKA, test storage (580ms)
      ✔ deposits correctly, test storage
      ✔ deposits correctly, test event
    ArkaStaking.withdraw
      ✔ withdraw correctly, test storage
      ✔ withdraw correctly, test event


  26 passing (3s)

·-----------------------------------|----------------------------|-------------|-----------------------------·
|       Solc version: 0.8.18        ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
····································|····························|·············|······························
|  Methods                                                                                                   │
················|···················|··············|·············|·············|···············|··············
|  Contract     ·  Method           ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
················|···················|··············|·············|·············|···············|··············
|  ArkaERC20    ·  approve          ·           -  ·          -  ·      46898  ·            4  ·          -  │
················|···················|··············|·············|·············|···············|··············
|  ArkaERC20    ·  setArkaMaster    ·           -  ·          -  ·      46382  ·            3  ·          -  │
················|···················|··············|·············|·············|···············|··············
|  ArkaMaster   ·  endCurrentStake  ·           -  ·          -  ·      47744  ·            4  ·          -  │
················|···················|··············|·············|·············|···············|··············
|  ArkaMaster   ·  interact         ·       67454  ·      84542  ·      81694  ·            6  ·          -  │
················|···················|··············|·············|·············|···············|··············
|  ArkaMaster   ·  proposeResource  ·      135244  ·     152260  ·     148236  ·           13  ·          -  │
················|···················|··············|·············|·············|···············|··············
|  ArkaMaster   ·  startNewStake    ·           -  ·          -  ·    1247041  ·            9  ·          -  │
················|···················|··············|·············|·············|···············|··············
|  ArkaStaking  ·  deposit          ·           -  ·          -  ·     120780  ·            5  ·          -  │
················|···················|··············|·············|·············|···············|··············
|  ArkaStaking  ·  withdraw         ·           -  ·          -  ·     116216  ·            3  ·          -  │
················|···················|··············|·············|·············|···············|··············
|  Deployments                      ·                                          ·  % of limit   ·             │
····································|··············|·············|·············|···············|··············
|  ArkaERC20                        ·           -  ·          -  ·    1724897  ·        5.7 %  ·          -  │
····································|··············|·············|·············|···············|··············
|  ArkaMaster                       ·     3683201  ·    3683213  ·    3683206  ·       12.3 %  ·          -  │
····································|··············|·············|·············|···············|··············
|  ChainlinkEthUsd                  ·           -  ·          -  ·     216906  ·        0.7 %  ·          -  │
·-----------------------------------|--------------|-------------|-------------|---------------|-------------·
  </pre>

</details>

<details>
<summary>

#### Couverture des tests au 8 avril 2023

</summary>

<pre>

❯ npx hardhat coverage

|File                  |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
|----------------------|----------|----------|----------|----------|----------------|
| contracts/           |    88.89 |       66 |     91.3 |    91.43 |                |
|  ArkaERC20.sol       |      100 |       75 |      100 |      100 |                |
|  ArkaMaster.sol      |    94.74 |       85 |    88.89 |       96 |            102 |
|  ArkaStaking.sol     |    80.95 |       50 |    88.89 |    86.84 |... 187,188,191 |
|  ChainlinkEthUsd.sol |      100 |      100 |      100 |      100 |                |
|----------------------|----------|----------|----------|----------|----------------|
|All files             |    88.89 |       66 |     91.3 |    91.43 |                |
|----------------------|----------|----------|----------|----------|----------------|

</pre>

</details>

### Workflow en développement

```shell
npx hardhat node
cd backend
npx hardhat run scripts/deployArka --network localhost # récupérer l'adresse du contrat (et éventuellement, copier l'ABI si changement)
cd ../frontend

# modifier adresse du contrat + abi dans frontend/src/contracts/ArkaMaster.ts/

yarn dev # va lancer `yarn wagmi generate` préalablement (cf. package.json)
```
### Mémo CLI hardhat

```shell
npx hardhat help # aide 
npx hardhat test # lancer les tests en local
REPORT_GAS=true npx hardhat test  # lancer les tests avec résumé sur le coût en gas
npx hardhat node # Lancer un client Ethereum en local. Possibilité de forker le mainnet (cf. hardhat.config.ts)
npx hardhat run scripts/deploy.ts # Lancer un script de déploiement qui va déployer des smart contracts
npx hardhat run scripts/deploy.ts --network sepolia # Déploiement sur sepolia
```

PS: si on ne met pas l'option `--network`, il va lancer le script sur une instance de hardhat node en mémoire, donc pas accessible ensuite en Remix p. ex. Donc toujours mettre renseigner cette option.



### Générer les types et les hooks de Wagmi

On utilise la génération de hooks custom en Wagmi. 
De ce fait, plutôt qu'avoir à utiliser un useContractRead pour le contrat ArkaMaster et la fonction startStake, 
on a a disposition un hook `useArkaMasterStartNewStake` avec l'abi, l'adresse, le nom, le provider (et le signer pour les fonctions write) de la fonction, déjà chargés.

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
