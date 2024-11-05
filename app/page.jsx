"use client"

import { useState, useEffect } from "react"

const HomePage = () => {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const userId = 1

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des produits")
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(`/api/cart?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setCart(data)
        }
      } catch (error) {
        console.error("Error fetching cart:", error)
      }
    }

    fetchProducts()
    fetchCart()
  }, [])

  const handleAddToCart = async (productId) => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId, quantity: 1 }), // Ajouter 1 par défaut
      })
      setCart((prevCart) => {
        const productInCart = prevCart.find(
          (item) => item.produit_id === productId
        )
        if (productInCart) {
          return prevCart.map((item) =>
            item.produit_id === productId
              ? { ...item, quantite: item.quantite + 1 }
              : item
          )
        } else {
          return [...prevCart, { produit_id: productId, quantite: 1 }]
        }
      })
    } catch (error) {
      console.error("Error adding product to cart:", error)
    }
  }

  const handleRemoveFromCart = async (productId) => {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId }),
      })
      setCart((prevCart) =>
        prevCart.filter((item) => item.produit_id !== productId)
      )
    } catch (error) {
      console.error("Error removing product from cart:", error)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Bienvenue sur Amazin
      </h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.produit_id}
                className="bg-white p-4 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold">{product.nom}</h2>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-lg font-bold">{product.prix} €</p>
                <p className="text-sm text-gray-500">
                  Quantité disponible: {product.quantite}
                </p>
                <button
                  className="mt-2 bg-blue-500 text-white p-2 rounded-lg"
                  onClick={() => handleAddToCart(product.produit_id)}
                >
                  Ajouter au panier
                </button>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Aucun produit trouvé
            </p>
          )}
        </div>
      )}
      <h2 className="text-xl font-bold mt-10 mb-4">Votre Panier</h2>
      {cart.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          {cart.map((produit) => (
            <div
              key={produit.produit_id}
              className="flex justify-between items-center"
            >
              <span>{`Produit ID: ${produit.produit_id} - Quantité: ${produit.quantite}`}</span>
              <button
                className="bg-red-500 text-white p-2 rounded-lg"
                onClick={() => handleRemoveFromCart(produit.produit_id)}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Aucun produit dans le panier.</p>
      )}
    </div>
  )
}

export default HomePage
