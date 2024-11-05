import { pool } from "@/app/api/bdd"

export const POST = async (request) => {
  const { userId, productId, quantity } = await request.json()

  try {
    // Vérifiez si le panier existe pour l'utilisateur
    const [cart] = await pool.query(
      "SELECT * FROM Paniers WHERE utilisateur_id = ?",
      [userId]
    )
    let cartId

    if (cart.length === 0) {
      // Créez un nouveau panier si aucun panier n'existe
      const [result] = await pool.query(
        "INSERT INTO Paniers (utilisateur_id) VALUES (?)",
        [userId]
      )
      cartId = result.insertId
    } else {
      cartId = cart[0].panier_id
    }

    // Vérifiez si le produit est déjà dans le panier
    const [existingProduct] = await pool.query(
      "SELECT * FROM Panier_Produits WHERE panier_id = ? AND produit_id = ?",
      [cartId, productId]
    )

    if (existingProduct.length > 0) {
      // Mettez à jour la quantité si le produit existe déjà
      const newQuantity = existingProduct[0].quantite + quantity
      await pool.query(
        "UPDATE Panier_Produits SET quantite = ? WHERE panier_id = ? AND produit_id = ?",
        [newQuantity, cartId, productId]
      )
    } else {
      // Ajoutez le produit au panier
      await pool.query(
        "INSERT INTO Panier_Produits (panier_id, produit_id, quantite) VALUES (?, ?, ?)",
        [cartId, productId, quantity]
      )
    }

    return new Response(
      JSON.stringify({ message: "Produit ajouté au panier" }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Error adding product to cart:", error)
    return new Response(
      JSON.stringify({
        message: "Erreur lors de l'ajout du produit au panier",
      }),
      { status: 500 }
    )
  }
}

export const DELETE = async (request) => {
  const { userId, productId } = await request.json()

  try {
    // Récupérez le panier de l'utilisateur
    const [cart] = await pool.query(
      "SELECT * FROM Paniers WHERE utilisateur_id = ?",
      [userId]
    )

    if (cart.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucun panier trouvé pour cet utilisateur" }),
        { status: 404 }
      )
    }

    const cartId = cart[0].panier_id

    // Supprimez le produit du panier
    await pool.query(
      "DELETE FROM Panier_Produits WHERE panier_id = ? AND produit_id = ?",
      [cartId, productId]
    )

    return new Response(
      JSON.stringify({ message: "Produit supprimé du panier" }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Error removing product from cart:", error)
    return new Response(
      JSON.stringify({
        message: "Erreur lors de la suppression du produit du panier",
      }),
      { status: 500 }
    )
  }
}
