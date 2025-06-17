import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send } from 'lucide-react';
import { Recette, RepasWithDetails } from '../lib/supabase';
import { OllamaService } from '../lib/ollamaService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollamaService] = useState(() => new OllamaService());
  const [recettes, setRecettes] = useState<Recette[]>([]);

  // Charger les recettes
  useEffect(() => {
    const loadRecipes = async () => {
      const { data: recettesData, error } = await supabase
        .from('recettes')
        .select('*');

      if (error) {
        console.error('Erreur lors du chargement des recettes:', error);
        return;
      }

      setRecettes(recettesData);
    };

    loadRecipes();
  }, []);

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
      
      // Obtenir une réponse d'Ollama
      const response = await ollamaService.generateResponse(userMessage, recettes, repasHistory);
      
      // Ajouter la réponse
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