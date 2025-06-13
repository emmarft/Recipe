import React from 'react'
import { Link } from 'react-router-dom'
import { ChefHat, Users, Calendar, Search, Plus } from 'lucide-react'

export function Home() {
  const features = [
    {
      name: 'Ajouter une recette',
      description: 'Créez et sauvegardez vos recettes préférées',
      href: '/add-recipe',
      icon: Plus,
      color: 'bg-blue-500',
    },
    {
      name: 'Rechercher recettes',
      description: 'Trouvez des recettes par ingrédient',
      href: '/search-recipes',
      icon: Search,
      color: 'bg-green-500',
    },
    {
      name: 'Ajouter un repas',
      description: 'Enregistrez vos repas avec invités et recettes',
      href: '/add-meal',
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      name: 'Historique des repas',
      description: 'Consultez l\'historique par invité',
      href: '/meal-history',
      icon: Users,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <ChefHat className="mx-auto h-16 w-16 text-orange-600" />
        <h1 className="mt-4 text-4xl font-bold text-gray-900">Mes Recettes</h1>
        <p className="mt-2 text-lg text-gray-600">
          Gérez vos recettes, invités et repas en un seul endroit
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.name}
              to={feature.href}
              className="group relative bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.color} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-orange-600">
                {feature.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {feature.description}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}