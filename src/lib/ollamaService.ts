import { Recette, RepasWithDetails } from './supabase';

export class OllamaService {
  private baseUrl: string = 'http://localhost:11434/api/generate';

  async generateResponse(userMessage: string, recettes: Recette[], repasHistory: RepasWithDetails[]): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(recettes, repasHistory);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: `${systemPrompt}\n\nUtilisateur: ${userMessage}\nAssistant:`,
          stream: false,
          temperature: 0.7,
          top_k: 40,
          top_p: 0.9,
          num_predict: 100,
          stop: ["Utilisateur:", "\n\n"]
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec Ollama');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Erreur Ollama:', error);
      return 'Désolé, je rencontre des difficultés pour traiter votre demande.';
    }
  }

  private buildSystemPrompt(recettes: Recette[], repasHistory: RepasWithDetails[]): string {
    const recettesInfo = recettes.map(r => `[${r.titre}]${r.ingredients}`).join('|');
    const repasServis = repasHistory.slice(-3).map(r => 
      `${r.invites.map(i => i.id).join('+')}>${r.recettes.map(rec => rec.id).join('+')}`
    ).join('|');

    return `[SYSTÈME] Assistant culinaire expert. Tu es un chef expert, réponds en français, de façon directe et concise.
CONTEXTE:
- Recettes: ${recettesInfo}
- Historique: ${repasServis}

INSTRUCTIONS:
1. Analyse rapide des ingrédients mentionnés
2. Suggestion de recettes pertinentes (évite les doublons pour mêmes invités)
3. Justification courte de tes choix
4. Si demandé: conseils de préparation brefs

FORMAT:
- Max 3 suggestions
- Réponses <100 mots
- Structure: Suggestion > Raison > Conseil (si nécessaire)`;
  }
}