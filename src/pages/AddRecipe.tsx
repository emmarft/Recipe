import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChefHat, Save } from 'lucide-react'

export function AddRecipe() {
  const [formData, setFormData] = useState({
    titre: '',
    ingredients: '',
    instructions: '',
    categorie: '',
    date_creation: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('recettes')
        .insert([{
          titre: formData.titre,
          ingredients: formData.ingredients,
          instructions: formData.instructions,
          categorie: formData.categorie || null,
          date_creation: formData.date_creation,
        }])

      if (error) throw error

      setMessage('Recette ajoutée avec succès!')
      setFormData({
        titre: '',
        ingredients: '',
        instructions: '',
        categorie: '',
        date_creation: new Date().toISOString().split('T')[0],
      })
    } catch (error) {
      setMessage('Erreur lors de l\'ajout de la recette')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Ajouter une recette</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700">
              Titre de la recette *
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              required
              value={formData.titre}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
              placeholder="Ex: Coq au vin"
            />
          </div>

          <div>
            <label htmlFor="categorie" className="block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <input
              type="text"
              id="categorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
              placeholder="Ex: Plat principal, Dessert, Entrée"
            />
          </div>

          <div>
            <label htmlFor="date_creation" className="block text-sm font-medium text-gray-700">
              Date de création *
            </label>
            <input
              type="date"
              id="date_creation"
              name="date_creation"
              required
              value={formData.date_creation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
            />
          </div>

          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
              Ingrédients *
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              required
              rows={6}
              value={formData.ingredients}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
              placeholder="Listez tous les ingrédients nécessaires..."
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
              Instructions *
            </label>
            <textarea
              id="instructions"
              name="instructions"
              required
              rows={8}
              value={formData.instructions}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
              placeholder="Décrivez étape par étape la préparation..."
            />
          </div>

          {message && (
            <div className={`p-4 rounded-md ${
              message.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer la recette'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}