import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { AddRecipe } from './pages/AddRecipe'
import { SearchRecipes } from './pages/SearchRecipes'
import { AddMeal } from './pages/AddMeal'
import { MealHistory } from './pages/MealHistory'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/search-recipes" element={<SearchRecipes />} />
          <Route path="/add-meal" element={<AddMeal />} />
          <Route path="/meal-history" element={<MealHistory />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App