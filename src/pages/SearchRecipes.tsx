import React, { useState, useEffect } from 'react'
import { supabase, Recette } from '../lib/supabase'
import { Search, Clock, Tag } from 'lucide-react'

export function SearchRecipes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [recipes, setRecipes] = useState<Recette[]>([])
  const [loading, setLoading] = useState(false)
  const [allRecipes, setAllRecipes] = useState<Recette[]>([])

  useEffect(() => {
    fetchAllRecipes()
  }, [])

  const fetchAllRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recettes')
        .select('*')
        .order('date_creation', { ascending: false })

      if (error) throw error
      setAllRecipes(data || [])
      setRecipes(data || [])
    } catch (error) {
      console.error('Error fetching recipes:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      setRecipes(allRecipes)
      return
    }

    setLoading(true)
    try {
      const filteredRecipes = allRecipes.filter(recipe =>
        recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.categorie && recipe.categorie.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setRecipes(filteredRecipes)
    } catch (error) {
      console.error('Error searching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Rechercher des recettes</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par ingrédient, titre ou catégorie..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{recipe.titre}</h3>
                {recipe.categorie && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Tag className="h-3 w-3 mr-1" />
                    {recipe.categorie}
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(recipe.date_creation)}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Ingrédients:</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{recipe.ingredients}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions:</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{recipe.instructions}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recipes.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune recette trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Essayez avec d\'autres mots-clés.' : 'Commencez par ajouter des recettes.'}
          </p>
        </div>
      )}
    </div>
  )
}