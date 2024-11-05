import { pool } from "@/app/api/bdd"

export const GET = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM Produits")
    return new Response(JSON.stringify(rows), { status: 200 })
  } catch (error) {
    console.error("Error fetching products:", error)
    return new Response(
      JSON.stringify({ message: "Error fetching products" }),
      { status: 500 }
    )
  }
}
