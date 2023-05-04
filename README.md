# CreepTDBot

CreepTDBot est un projet de bot Discord permettant aux utilisateurs de Discord de récupérer des informations du jeu CreepTD directement depuis l'API du jeu.
Le projet a été initialisé le 13 mars 2022 et a été conclu le 25 avril 2022.
Le programme est sécurisé et ne contient à ce jour aucun bug connu. Le projet est entièrement terminé et fonctionnel.

# Commandes
**setlanguage**: Cette commande permet de modifier la langue du bot sur le serveur où elle est utilisée. La commande ne peut être utilisée que par un utilisateur ayant les droits administrateur sur le serveur en question. Elle prend en paramètre une chaîne de caractère "language" contenant le code ISO 639-1 d'une des langues disponibles (EN et FR).

**link**: Cette commande permet de lier son compte Discord à un compte CreepTD. La commande prend en paramètre une chaîne de caractères "username" contenant le nom d'utilisateur CreepTD à lier au compte Discord. Un compte Discord ne peut être lié qu'à un seul compte CreepTD et inversement.

**unlink**: Cette commande permet de retirer la liaison entre un compte Discord et un compte CreepTD. La commande ne prend aucun paramètre.

**map**: Cette commande permet d'afficher les informations d'une map CreepTD. La commande prend en paramètre une chaîne de caractères "map" contenant le nom (unique) d'une map du jeu.

**randmap**: Cette commande permet d'afficher les informations d'une map aléatoire. Elle prend en paramètre une chaîne de caractères "size" contenant une taille de map CreepTD, soit "16x16", "32x16" ou "32x32". Si le paramètre est spécifié, alors le bot va chercher une map uniquement dans la taille spécifié par ce paramètre. Dans le cas contraire, il va chercher parmi toutes les maps existantes.

**playerstats**: Cette commande permet d'afficher les statistiques d'un compte CreepTD. Elle prend deux paramètres optionnels.
Le premier, "username", contient le nom d'utilisateur CreepTD dont l'utilisateur veut voir les statistiques. 
Le second, "user", contient la mention d'un utilisateur discord. Si cet utilisateur a un compte CreepTD lié à son à compte Discord, le bot affichera les statistiques du compte CreepTD en question.
Dans le cas où aucun argument n'est envoyé avec, ce sont les statistiques du compte CreepTD de l'utilisateur ayant effectué la commande qui seront affichées.

**history**: Cette commande fonctionne de la même manière que la commande "playerstats", avec les mêmes paramètres. Cependant, celle-ci affiche l'historique des parties d'un compte CreepTD, avec, pour chaque partie, un lien redirigeant vers le récapitulatif de la partie directement sur le site officiel de CreepTD.

# Specifications techniques
Le bot utilise une base de données SQL très simple afin de stocker les liaisons de comptes Discord/CreepTD ainsi que la langue utilisée pour chaque serveur Discord. Il fonctionne sous discord.js 13.6.0.
