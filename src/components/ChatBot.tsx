import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send } from 'lucide-react';
import { Recette, RepasWithDetails } from '../lib/supabase';
import { RecipeRecommender } from '../lib/recipeRecommender';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommender] = useState(() => new RecipeRecommender());

  // Charger les recettes dans l'arbre de décision
  useEffect(() => {
    const loadRecipes = async () => {
      const { data: recettes, error } = await supabase
        .from('recettes')
        .select('*');

      if (error) {
        console.error('Erreur lors du chargement des recettes:', error);
        return;
      }

      recettes.forEach(recette => recommender.addRecipe(recette));
    };

    loadRecipes();
  }, [recommender]);

  // Récupérer l'historique des repas
  const getRepasHistory = async () => {
    const { data: repasData, error } = await supabase
      .from('repas')
      .select(`
        *,
        repas_invites (invite_id),
        repas_recettes (recette_id)
      `);

    if (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }

    return repasData as RepasWithDetails[];
  };

  // Analyser les ingrédients depuis le message de l'utilisateur
  const parseIngredientsFromMessage = (message: string): string[] => {
    return message
      .toLowerCase()
      .split(/[,.]/) // Sépare par virgule ou point
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);
  };

  // Formater la réponse avec les recettes recommandées
  const formatRecipeResponse = (recettes: Recette[]): string => {
    if (recettes.length === 0) {
      return 'Je ne trouve pas de recettes correspondant à vos ingrédients. Pourriez-vous me donner plus de détails sur les ingrédients dont vous disposez ?';
    }

    const response = ['Voici les recettes que je vous suggère :'];
    recettes.slice(0, 3).forEach((recette, index) => {
      response.push(`\n${index + 1}. ${recette.titre}\nIngrédients nécessaires : ${recette.ingredients}\nInstructions : ${recette.instructions}`);
    });

    return response.join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Récupérer l'historique des repas
      const repasHistory = await getRepasHistory();
      
      // Extraire les ingrédients du message
      const ingredients = parseIngredientsFromMessage(userMessage);
      
      // Obtenir les recommandations
      const recommendedRecipes = recommender.findRecipes(ingredients, repasHistory);
      
      // Formater et ajouter la réponse
      const response = formatRecipeResponse(recommendedRecipes);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Erreur lors de la recommandation:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Désolé, je rencontre des difficultés pour traiter votre demande.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Assistant Culinaire</h2>
          </div>
        </div>

        <div className="p-6 space-y-4 h-[500px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-orange-100 text-gray-900' : 'bg-gray-100 text-gray-900'}`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                Je réfléchis à des suggestions...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Quels ingrédients avez-vous ?"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}