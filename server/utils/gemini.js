const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function generateRoutine(healthProfile) {
  const { weight, height, age, gender, activityLevel, goal, bmi, tmb } = healthProfile;

  const goalDescriptions = {
    lose_fat: 'perder grasa corporal y definir músculo',
    gain_muscle: 'ganar masa muscular y fuerza',
    maintain: 'mantener el peso actual y mejorar condición física',
    improve_health: 'mejorar la salud general y bienestar'
  };

  const prompt = `Eres un entrenador personal experto. Genera un plan de entrenamiento semanal personalizado.

PERFIL DEL USUARIO:
- Peso: ${weight} kg
- Altura: ${height} cm
- Edad: ${age} años
- Género: ${gender === 'male' ? 'Masculino' : gender === 'female' ? 'Femenino' : 'Otro'}
- Nivel de actividad: ${activityLevel}
- IMC: ${bmi}
- TMB: ${tmb} kcal/día
- Objetivo: ${goalDescriptions[goal] || goal}

Genera un plan de 7 días en formato JSON con la siguiente estructura exacta:
{
  "weekPlan": [
    {
      "day": "Lunes",
      "focus": "Tren Superior",
      "exercises": [
        {
          "name": "Nombre del ejercicio",
          "sets": 3,
          "reps": "12",
          "rest": "60s",
          "estimatedTime": 180,
          "notes": "Nota opcional"
        }
      ],
      "duration": "45 min",
      "calories": 300
    }
  ],
  "tips": ["Consejo 1", "Consejo 2"],
  "weeklyGoal": "Descripción del objetivo semanal"
}

IMPORTANTE: 
- El campo "estimatedTime" es el tiempo estimado en SEGUNDOS para completar todas las series del ejercicio (incluyendo descansos entre series). Calcula basándote en: (sets * tiempo_por_serie) + (sets-1 * tiempo_descanso). Por ejemplo, 3 series de 12 reps con 60s descanso = aproximadamente 180 segundos.
- Los "tips" deben ser texto plano y natural, SIN formato markdown (sin asteriscos **, sin negritas, sin viñetas). Escribe cada consejo como una oración completa y natural.

Incluye ejercicios apropiados para el nivel y objetivo del usuario. Alterna grupos musculares. Incluye días de descanso activo o cardio según sea necesario.
Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating routine:', error);
    throw new Error('Failed to generate routine');
  }
}

async function analyzeIngredients(imageBase64) {
  const prompt = `Analiza esta imagen de una nevera o despensa y lista todos los ingredientes visibles.

Responde en formato JSON con la siguiente estructura:
{
  "ingredients": [
    {
      "name": "Nombre del ingrediente",
      "quantity": "Cantidad aproximada",
      "category": "Categoría (proteína, vegetal, lácteo, fruta, carbohidrato, condimento, otro)",
      "freshness": "Estado (fresco, por vencer, vencido)"
    }
  ],
  "summary": "Resumen breve de lo que hay disponible"
}

Sé específico con los ingredientes que puedas identificar claramente.
Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    throw new Error('Failed to analyze ingredients');
  }
}

async function generateRecipe(ingredients, healthProfile) {
  const { goal, tmb, tdee } = healthProfile;

  const targetCalories = goal === 'lose_fat' ? Math.round(tdee * 0.8) :
    goal === 'gain_muscle' ? Math.round(tdee * 1.1) :
      tdee;

  const mealCalories = Math.round(targetCalories / 3);

  const ingredientList = ingredients.map(i => i.name).join(', ');

  const prompt = `Eres un chef nutricionista experto. Genera una receta saludable usando estos ingredientes disponibles.

INGREDIENTES DISPONIBLES:
${ingredientList}

PERFIL NUTRICIONAL DEL USUARIO:
- Objetivo: ${goal}
- Calorías objetivo por comida: ~${mealCalories} kcal

Genera una receta en formato JSON:
{
  "name": "Nombre de la receta",
  "description": "Descripción breve",
  "prepTime": "15 min",
  "cookTime": "20 min",
  "servings": 2,
  "difficulty": "Fácil/Media/Difícil",
  "ingredients": [
    {
      "item": "Ingrediente",
      "amount": "Cantidad"
    }
  ],
  "instructions": [
    "Paso 1",
    "Paso 2"
  ],
  "nutrition": {
    "calories": 350,
    "protein": "25g",
    "carbs": "30g",
    "fat": "12g",
    "fiber": "5g"
  },
  "explanation": "Te recomiendo esta receta porque...",
  "tips": ["Consejo 1"]
}

La receta debe ser práctica, deliciosa y alineada con el objetivo del usuario.
Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw new Error('Failed to generate recipe');
  }
}

async function chatTherapist(messages, userName) {
  const systemPrompt = `Eres un psicólogo con enfoque Adleriano, especializado en bienestar y desarrollo personal. Tu nombre es "Mente" y eres parte de la app Be Fit.

PRINCIPIOS ADLERIANOS QUE APLICAS:
- Enfoque en el propósito y metas de vida
- Sentimiento de comunidad y conexión social
- Superación de complejos de inferioridad
- Responsabilidad personal y coraje
- Estilo de vida y patrones de comportamiento

ESTILO DE COMUNICACIÓN:
- Empático pero orientado a la acción
- Haces preguntas reflexivas que invitan al autoconocimiento
- No solo consuelas, ayudas a encontrar soluciones prácticas
- Usas un tono cálido pero profesional
- Respondes en español

IMPORTANTE:
- Nunca diagnostiques condiciones médicas
- Si detectas señales de crisis, sugiere buscar ayuda profesional
- Mantén las respuestas concisas pero significativas (2-4 párrafos)
- Recuerda el contexto de la conversación

El usuario se llama ${userName || 'amigo/a'}.`;

  const chatHistory = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  try {
    const chat = textModel.startChat({
      history: chatHistory.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7
      }
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(systemPrompt + '\n\nUsuario: ' + lastMessage);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error('Failed to process chat message');
  }
}

async function generateWellnessTips(mood) {
  const prompt = `Genera 3 tarjetas de bienestar y productividad personalizadas para alguien que se siente: ${mood || 'neutral'}.

Incluye temas como:
- Técnicas de productividad (Pomodoro, GTD, etc.)
- Filosofía práctica (Estoicismo, Mindfulness)
- Manejo de emociones
- Hábitos saludables

Responde en formato JSON:
{
  "cards": [
    {
      "title": "Título corto",
      "category": "Productividad/Mindfulness/Hábitos/Filosofía",
      "content": "Contenido de 2-3 oraciones con información práctica",
      "actionTip": "Una acción concreta que pueden hacer ahora"
    }
  ]
}

Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating tips:', error);
    throw new Error('Failed to generate wellness tips');
  }
}

module.exports = {
  generateRoutine,
  analyzeIngredients,
  generateRecipe,
  chatTherapist,
  generateWellnessTips
};
