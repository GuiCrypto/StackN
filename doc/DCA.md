

# principe

Un déposant dépose dans le smart contract (UsdEth_monthly_swap) une somme d'USDC, il indique également la valeur de son DCA. 
Cela mettra a jour le Smart contract qui stockera pour chacun des composants : 
* sa balance en usdc
* sa balance en eth
* la valeur de son swap mensuel exprimée en usdc


Chaque premier du mois (ou les jous suivant si le DCA n'a pas été fait le premier du mois) le DCA est exécuté par **UN** des Déposants sur le smart contract le swap est réalisé pour **TOUS** les déposants. Celui ci avance les frais en gas de l'opération qui lui sont remboursés par la suite (+ une incentive à déterminer).
Le DCA s'effectue via un échangeur décentralisé (Parswap, uniswap ...) une fois le swap réalisé les sous vont sur le smart contract et la balance des déposants est mise à jour.


## que peut faire le dépositor ?

### faire un dépot

Le déposant effectue un dépot cela mets à jour une Struct qui contient 3 informations (balance usdc, balance eth, valeur du swap mensuel) stockée dans un mapping avec pour clef l'adresse du déposant en valeur la Struct qui lui est associée.

Le déposant peut faire autant de dépot qu'il le souhaite (s'il en a déjà fait un auparavant ça mettra à jour sa balance en usdc et la valeur du swap qu'il souhaite faire). 
En faisant un dépot il indique la valeur de son swap mensuel qui est toujours supérieur à 0. Ainsi tant que sa balance en usdc est strictement supérieur ou égale à la valeur du swap mensuel qu'il souhaite réaliser son dca pour se faire.

### faire un retrait

Un déposant peut faire un retrait à tout moment, à partir du moment où il a des sous sur le protocol. Deux fonctions permettent de faire un retrait. Retrait USD et retrait ETH.

> Pour des raisons de sécurité dans le protocole, le retrait se fait indépendament du swap (methode _Pull Over Push_). pour éviter l'attaque DoS Unexpected Error.

### executer le swap mensuel

> Point de vigilence : attention à la DOS Gas limit attaque. Il faudra surement paginer (faire le swap uniquement sur un sous ensemble de déposant et pas tous si le nombre de déposant dépasse un certain seuil). Est un problème ? Pas forcément ça permet de créer plusieurs incentive par mois à faire le DCA.

## figure imposée le stacking.

On pourrait imaginer que pendant que l'argent dors (les 27/28/29/30 autres jours du mois) on place les USDC sur un protocole pour avoir du rendement suplémentaire. 








