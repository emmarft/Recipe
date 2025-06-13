import React, { useState, useEffect } from 'react'
import { supabase, Recette, Invite } from '../lib/supabase'
import { Calendar, Users, ChefHat, Save } from 'lucide-react'

export function AddMeal() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    commentaire: '',
  })
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([])
  const [guests, setGuests] = useState<Invite[]>([])
  const [recipes, setRecipes] = useState<Recette[]>([])
  const [newGuestName, setNewGuestName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchGuests()
    fetchRecipes()
  }, [])

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('nom')

      if (error) throw error
      setGuests(data || [])
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recettes')
        .select('*')
        .order('titre')

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error('Error fetching recipes:', error)
    }
  }

  const addNewGuest = async () => {
    if (!newGuestName.trim()) return

    try {
      const { data, error } = await supabase
        .from('invites')
        .insert([{ nom: newGuestName.trim() }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setGuests([...guests, data[0]])
        setSelectedGuests([...selectedGuests, data[0].id])
        setNewGuestName('')
      }
    } catch (error) {
      console.error('Error adding guest:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedGuests.length === 0 || selectedRecipes.length === 0) {
      setMessage('Veuillez sélectionner au moins un invité et une recette')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Insert the meal
      const { data: mealData, error: mealError } = await supabase
        .from('repas')
        .insert([{
          date: formData.date,
          commentaire: formData.commentaire || null,
        }])
        .select()

      if (mealError) throw mealError

      const mealId = mealData[0].id

      // Insert meal-guest relationships
      const guestRelations = selectedGuests.map(guestId => ({
        repas_id: mealId,
        invite_id: guestId,
      }))

      const { error: guestError } = await supabase
        .from('repas_invites')
        .insert(guestRelations)

      if (guestError) throw guestError

      // Insert meal-recipe relationships
      const recipeRelations = selectedRecipes.map(recipeId => ({
        repas_id: mealId,
        recette_id: recipeId,
      }))

      const { error: recipeError } = await supabase
        .from('repas_recettes')
        .insert(recipeRelations)

      if (recipeError) throw recipeError

      setMessage('Repas ajouté avec succès!')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        commentaire: '',
      })
      setSelectedGuests([])
      setSelectedRecipes([])
    } catch (error) {
      setMessage('Erreur lors de l\'ajout du repas')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestToggle = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    )
  }

  const handleRecipeToggle = (recipeId: string) => {
    setSelectedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Ajouter un repas</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date du repas *
              </label>
              <input
                type="date"
                id="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
              />
            </div>

            <div>
              <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700">
                Commentaire
              </label>
              <input
                type="text"
                id="commentaire"
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
                placeholder="Notes sur le repas..."
              />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-medium text-gray-900">Invités *</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="Nom du nouvel invité"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
                />
                <button
                  type="button"
                  onClick={addNewGuest}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Ajouter
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {guests.map((guest) => (
                  <label key={guest.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGuests.includes(guest.id)}
                      onChange={() => handleGuestToggle(guest.id)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{guest.nom}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ChefHat className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-medium text-gray-900">Recettes *</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipes.map((recipe) => (
                <label key={recipe.id} className="flex items-start space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRecipes.includes(recipe.id)}
                    onChange={() => handleRecipeToggle(recipe.id)}
                    className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{recipe.titre}</div>
                    {recipe.categorie && (
                      <div className="text-xs text-gray-500">{recipe.categorie}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
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
              <span>{loading ? 'Enregistrement...' : 'Enregistrer le repas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}