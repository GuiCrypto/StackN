

# principe

Un déposant dépose une somme d'USDC dans le smart contract (UsdEth_monthly_swap) et indique également la valeur de son DCA. Cela mettra à jour le smart contract qui stockera pour chacun des composants :

* sa balance en USDC
* sa balance en ETH
* la valeur de son swap mensuel exprimée en USDC

Chaque premier du mois (ou les jours suivants si le DCA n'a pas été fait le premier du mois), le DCA est exécuté par l'**un** des déposants sur le smart contract. Le swap est réalisé pour **tous** les déposants. Celui-ci avance les frais en gaz de l'opération, qui lui sont remboursés par la suite (+ une incentive à déterminer). Le DCA s'effectue via un échangeur décentralisé (Parswap, Uniswap...). Une fois le swap réalisé, les fonds vont sur le smart contract et la balance des déposants est mise à jour.

## Architecure

![](https://raw.githubusercontent.com/GuiCrypto/StackN/main/schema/DCA_decentralise.png)

## que peut faire le dépositor ?

### faire un dépot

Le déposant effectue un dépôt, ce qui met à jour une structure contenant trois informations (balance USDC, balance ETH, valeur du swap mensuel) stockée dans un mapping avec pour clé l'adresse du déposant et pour valeur la structure qui lui est associée.

Le déposant peut faire autant de dépôts qu'il le souhaite (s'il en a déjà effectué un auparavant, cela mettra à jour sa balance en USDC et la valeur du swap qu'il souhaite réaliser). En effectuant un dépôt, il indique la valeur de son swap mensuel qui est toujours supérieure à 0. Ainsi, tant que sa balance en USDC est strictement supérieure ou égale à la valeur du swap mensuel qu'il souhaite réaliser, son DCA se fera.

### faire un retrait

Un déposant peut effectuer un retrait à tout moment, à partir du moment où il a des fonds sur le protocole. Deux fonctions permettent de faire un retrait : retrait USDC et retrait ETH.

> Pour des raisons de sécurité dans le protocole, le retrait se fait indépendamment du swap (méthode _Pull Over Push_) pour éviter l'attaque DoS (Denial of Service) Unexpected Error

### executer le swap mensuel

 > Point de vigilance : attention à la DOS Gas limit attaque. Il faudra sûrement paginer (faire le swap uniquement sur un sous-ensemble de déposants et pas tous si le nombre de déposants dépasse un certain seuil). Est-ce un problème ? Pas forcément, cela permet de créer plusieurs incitations par mois pour faire le DCA.

## Figure imposée : le stacking.

On pourrait imaginer que pendant que l'argent dort (les 27/28/29/30 autres jours du mois), on place les USDC sur un protocole pour avoir un rendement supplémentaire.






