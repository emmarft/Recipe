import React, { useState, useEffect } from 'react'
import { supabase, Invite, RepasWithDetails } from '../lib/supabase'
import { Users, Calendar, ChefHat, MessageSquare } from 'lucide-react'

export function MealHistory() {
  const [guests, setGuests] = useState<Invite[]>([])
  const [selectedGuest, setSelectedGuest] = useState<string>('')
  const [meals, setMeals] = useState<RepasWithDetails[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGuests()
  }, [])

  useEffect(() => {
    if (selectedGuest) {
      fetchMealsByGuest(selectedGuest)
    } else {
      setMeals([])
    }
  }, [selectedGuest])

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

  const fetchMealsByGuest = async (guestId: string) => {
    setLoading(true)
    try {
      // Get meals for the selected guest
      const { data: mealIds, error: mealIdsError } = await supabase
        .from('repas_invites')
        .select('repas_id')
        .eq('invite_id', guestId)

      if (mealIdsError) throw mealIdsError

      if (!mealIds || mealIds.length === 0) {
        setMeals([])
        return
      }

      const repasIds = mealIds.map(m => m.repas_id)

      // Get meal details
      const { data: repasData, error: repasError } = await supabase
        .from('repas')
        .select('*')
        .in('id', repasIds)
        .order('date', { ascending: false })

      if (repasError) throw repasError

      // For each meal, get guests and recipes
      const mealsWithDetails = await Promise.all(
        (repasData || []).map(async (repas) => {
          // Get guests for this meal
          const { data: guestData, error: guestError } = await supabase
            .from('repas_invites')
            .select(`
              invites (
                id,
                nom,
                created_at
              )
            `)
            .eq('repas_id', repas.id)

          if (guestError) throw guestError

          // Get recipes for this meal
          const { data: recipeData, error: recipeError } = await supabase
            .from('repas_recettes')
            .select(`
              recettes (
                id,
                titre,
                ingredients,
                instructions,
                categorie,
                date_creation,
                created_at
              )
            `)
            .eq('repas_id', repas.id)

          if (recipeError) throw recipeError

          return {
            ...repas,
            invites: guestData?.map(g => g.invites).filter(Boolean) || [],
            recettes: recipeData?.map(r => r.recettes).filter(Boolean) || [],
          }
        })
      )

      setMeals(mealsWithDetails)
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Historique des repas</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-md">
            <label htmlFor="guest-select" className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un invité
            </label>
            <select
              id="guest-select"
              value={selectedGuest}
              onChange={(e) => setSelectedGuest(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
            >
              <option value="">-- Choisir un invité --</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement...</p>
        </div>
      )}

      {!loading && meals.length > 0 && (
        <div className="space-y-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(meal.date)}
                    </h3>
                  </div>
                  {meal.commentaire && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MessageSquare className="h-4 w-4" />
                      <span>{meal.commentaire}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Invités présents</h4>
                    </div>
                    <div className="space-y-1">
                      {meal.invites.map((invite) => (
                        <span
                          key={invite.id}
                          className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-2 mb-1"
                        >
                          {invite.nom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <ChefHat className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Recettes servies</h4>
                    </div>
                    <div className="space-y-2">
                      {meal.recettes.map((recette) => (
                        <div key={recette.id} className="p-2 bg-green-50 rounded-md">
                          <div className="font-medium text-green-900">{recette.titre}</div>
                          {recette.categorie && (
                            <div className="text-xs text-green-700">{recette.categorie}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && selectedGuest && meals.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun repas trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cet invité n'a participé à aucun repas enregistré.
          </p>
        </div>
      )}

      {!selectedGuest && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sélectionnez un invité</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choisissez un invité pour voir l'historique de ses repas.
          </p>
        </div>
      )}
    </div>
  )
}