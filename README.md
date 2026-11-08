# Saut stellaire

Une course sans fin sur une planète lointaine : ton héros court tout seul, à toi de sauter au bon moment par-dessus les cristaux, de rester au sol sous les météores et d'attraper les étoiles. La vitesse augmente à mesure que tu avances.

*English version: [README.en.md](README.en.md)*

## Commandes

- **Espace**, **↑** ou **clic** : sauter. **Maintiens** pour sauter plus haut.
- **Rappuie en l'air** : double saut.
- **↓** : retomber vite.
- **P** ou **Échap** : pause.
- Après une chute, **Espace** relance une course.

## Les obstacles

- **Cristaux** : ils sortent du sol, saute par-dessus.
- **Météores** : ils filent à hauteur de tête après les premiers instants ; reste au sol pour qu'ils passent au-dessus de toi.

L'écart entre deux obstacles laisse toujours le temps d'un saut à la vitesse du moment, mais il se réduit avec la distance. La vitesse monte peu à peu, jusqu'à plus du double de celle du départ.

## Étoiles et bonus

- Les **étoiles** flottent seules ou par trois. Attrapées à la suite, elles forment une **série** : le multiplicateur monte de 1 toutes les 5 étoiles, jusqu'à ×4. Laisser passer une étoile remet la série à zéro.
- Le **bouclier** encaisse un choc à ta place ; il en apparaît un de temps en temps quand tu n'en as pas.

## Points

Le score vaut 1 point par 10 mètres parcourus, plus 25 points par étoile multipliés par le multiplicateur du moment. Une bannière salue chaque millier de mètres.

## Données et synchronisation

Ton record est enregistré par NeoDex, sauvegardé et synchronisé entre tes PC si la synchro est activée. Au premier lancement, le plugin reprend ce que tu avais déjà dans NeoDex.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Saut stellaire → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
