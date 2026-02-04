const { GoogleGenerativeAI } = require('@google/generative-ai');
const { chatWithGroq } = require('./groq');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Flag to track if we should use Groq as primary for chat
let useGroqForChat = !!process.env.GROQ_API_KEY;

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

    // Handle quota exceeded error
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('Límite de uso alcanzado. Por favor espera unos minutos e intenta de nuevo.');
    }

    throw new Error('No se pudo analizar la imagen. Intenta de nuevo más tarde.');
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
IMPORTANTE: No uses asteriscos, negritas, markdown ni formato especial en ningún texto. Escribe todo en texto plano natural.
Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const recipe = JSON.parse(text);

    // Clean markdown from all string fields
    const cleanMarkdown = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s*/gm, '').replace(/_([^_]+)_/g, '$1');
    };

    recipe.name = cleanMarkdown(recipe.name);
    recipe.description = cleanMarkdown(recipe.description);
    recipe.explanation = cleanMarkdown(recipe.explanation);
    recipe.instructions = recipe.instructions?.map(cleanMarkdown) || [];
    recipe.tips = recipe.tips?.map(cleanMarkdown) || [];

    return recipe;
  } catch (error) {
    console.error('Error generating recipe:', error);

    // Handle quota exceeded error
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('Límite de uso alcanzado. Por favor espera unos minutos e intenta de nuevo.');
    }

    throw new Error('No se pudo generar la receta. Intenta de nuevo más tarde.');
  }
}

async function chatTherapist(messages, userName, userMood = null) {
  // Try Groq first if available (better free tier)
  if (useGroqForChat) {
    try {
      console.log('[Chat] Using Groq API');
      return await chatWithGroq(messages, userName, userMood);
    } catch (error) {
      console.error('[Chat] Groq failed, trying Gemini:', error.message);
    }
  }

  // Fallback to Gemini
  const moodContext = {
    happy: 'El usuario parece estar de buen ánimo. Celebra con él y ayúdale a mantener ese estado positivo.',
    neutral: 'El usuario tiene un estado neutral. Explora cómo se siente realmente.',
    sad: 'El usuario parece triste. Sé especialmente empático y validador. No minimices sus sentimientos.',
    anxious: 'El usuario parece ansioso. Ayúdale a sentirse seguro y a poner las cosas en perspectiva.',
    frustrated: 'El usuario parece frustrado. Valida su frustración y ayúdale a canalizar esa energía.',
    stressed: 'El usuario parece estresado. Ofrece calma y técnicas prácticas de manejo.'
  };

  const systemPrompt = `Eres "Mente", un acompañante de bienestar emocional con enfoque en Psicología Adleriana. Eres parte de la app Be Fit y tu misión es ayudar a las personas a vivir con más propósito y bienestar.

PERSONALIDAD:
- Eres cálido/a, cercano/a y genuinamente interesado/a en la persona
- Hablas como un amigo sabio, no como un robot ni un profesional distante
- Usas un lenguaje natural, con contracciones y expresiones coloquiales cuando es apropiado
- Nunca usas frases genéricas como "entiendo cómo te sientes" sin contexto real
- Evitas sonar repetitivo o predecible

PRINCIPIOS ADLERIANOS QUE GUÍAN TUS RESPUESTAS:
1. Propósito de vida: Ayudas a conectar las experiencias con metas y significado personal
2. Sentimiento de comunidad: Recuerdas que somos seres sociales y la conexión importa
3. Coraje imperfecto: Animas a actuar aunque no sea perfecto
4. Responsabilidad personal: Sin culpar, invitas a ver qué está en su control
5. Inferioridad como motor: Los desafíos son oportunidades de crecimiento

ESTRUCTURA DE TUS RESPUESTAS (sigue este orden natural):
1. VALIDACIÓN (1-2 oraciones): Reconoce genuinamente lo que la persona siente o vive. Sé específico, no genérico.
2. REFLEXIÓN (2-3 oraciones): Ofrece una perspectiva nueva o haz una pregunta que invite a pensar diferente. Conecta con sus metas o valores si es posible.
3. ACCIÓN (1-2 oraciones): Sugiere algo concreto y alcanzable que pueda hacer, o invita a profundizar en la conversación.

${userMood && moodContext[userMood] ? `CONTEXTO EMOCIONAL: ${moodContext[userMood]}` : ''}

REGLAS IMPORTANTES:
- Responde en español, de forma natural y fluida
- Mantén respuestas de 3-5 oraciones máximo (no párrafos largos)
- Si detectas señales de crisis (autolesión, suicidio, abuso), responde con empatía y sugiere buscar ayuda profesional inmediata
- Nunca diagnostiques ni des consejos médicos
- Usa el nombre "${userName || 'amigo/a'}" ocasionalmente para personalizar
- Termina con algo que invite a continuar la conversación (pregunta o reflexión abierta)
- NO uses asteriscos, negritas ni formato markdown en tus respuestas`;

  // Build conversation history for context (exclude last message which we'll send)
  const chatHistory = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  try {
    console.log('[Chat] Using Gemini API with', messages.length, 'messages in history');

    // Use systemInstruction for proper context handling
    const chat = textModel.startChat({
      systemInstruction: systemPrompt,
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.85
      }
    });

    // Send only the user's message, not concatenated with system prompt
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;

    // Clean any markdown formatting that might slip through
    let text = response.text();
    text = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s*/gm, '');

    return text;
  } catch (error) {
    console.error('[Chat] Gemini failed:', error.message);
    // Return a fallback response when all APIs are unavailable
    const fallbackResponses = {
      happy: `¡Qué bueno saber que te sientes bien, ${userName || 'amigo/a'}! Esos momentos de bienestar son valiosos. ¿Qué crees que ha contribuido a que te sientas así hoy? A veces identificar esas pequeñas cosas nos ayuda a cultivar más momentos como este.`,
      sad: `Gracias por compartir cómo te sientes, ${userName || 'amigo/a'}. No es fácil expresar cuando estamos pasando por un momento difícil, y eso ya es un paso importante. ¿Hay algo específico que te gustaría explorar o simplemente necesitas que te escuche?`,
      anxious: `Entiendo que la ansiedad puede ser abrumadora, ${userName || 'amigo/a'}. Respira profundo, estás en un lugar seguro ahora mismo. ¿Qué es lo que más te preocupa en este momento? A veces ponerlo en palabras ayuda a verlo con más claridad.`,
      stressed: `El estrés puede hacernos sentir que todo es urgente, ${userName || 'amigo/a'}. Pero recuerda: no tienes que resolver todo ahora mismo. ¿Cuál es la cosa más importante que necesitas atender hoy? Enfoquémonos en eso primero.`,
      frustrated: `La frustración es una señal de que algo te importa, ${userName || 'amigo/a'}. Esa energía puede transformarse en acción. ¿Qué es lo que te está frustrando? Cuéntame más para ver cómo podemos darle la vuelta.`,
      neutral: `Hola ${userName || 'amigo/a'}, me alegra que estés aquí. Estoy disponible para escucharte y acompañarte en lo que necesites. ¿Cómo ha sido tu día? ¿Hay algo en particular de lo que te gustaría hablar?`
    };

    return fallbackResponses[userMood] || fallbackResponses.neutral;
  }
}

// Fallback tips when API is unavailable or rate limited
const FALLBACK_TIPS = {
  neutral: {
    cards: [
      {
        title: "Técnica Pomodoro",
        category: "Productividad",
        content: "Trabaja en bloques de 25 minutos con descansos de 5 minutos. Esta técnica mejora la concentración y reduce la fatiga mental.",
        actionTip: "Configura un timer de 25 minutos y enfócate en una sola tarea."
      },
      {
        title: "Respiración consciente",
        category: "Mindfulness",
        content: "Tomar pausas para respirar profundamente activa el sistema nervioso parasimpático, reduciendo el estrés y mejorando la claridad mental.",
        actionTip: "Haz 5 respiraciones profundas ahora mismo: inhala 4 segundos, mantén 4, exhala 4."
      },
      {
        title: "Gratitud diaria",
        category: "Hábitos",
        content: "Escribir 3 cosas por las que estás agradecido cada día mejora el bienestar emocional y la perspectiva de vida.",
        actionTip: "Piensa en 3 cosas buenas que te pasaron hoy, por pequeñas que sean."
      }
    ]
  },
  happy: {
    cards: [
      {
        title: "Capitaliza tu energía",
        category: "Productividad",
        content: "Cuando te sientes bien, es el momento perfecto para abordar tareas desafiantes o creativas que requieren más energía mental.",
        actionTip: "Elige esa tarea que has estado posponiendo y hazla ahora."
      },
      {
        title: "Comparte tu alegría",
        category: "Filosofía",
        content: "La psicología Adleriana nos recuerda que la conexión social es fundamental. Compartir momentos positivos fortalece los vínculos.",
        actionTip: "Envía un mensaje a alguien que aprecias para compartir cómo te sientes."
      },
      {
        title: "Ancla este momento",
        category: "Mindfulness",
        content: "Crear anclas mentales de momentos positivos te ayuda a acceder a esa energía cuando la necesites en el futuro.",
        actionTip: "Cierra los ojos y memoriza cómo se siente este momento de bienestar."
      }
    ]
  },
  sad: {
    cards: [
      {
        title: "Movimiento suave",
        category: "Hábitos",
        content: "El ejercicio ligero libera endorfinas naturales. No necesitas una rutina intensa, solo moverte un poco puede cambiar tu estado.",
        actionTip: "Camina 10 minutos o haz algunos estiramientos suaves."
      },
      {
        title: "Autocompasión",
        category: "Mindfulness",
        content: "Está bien no estar bien. Tratarte con la misma amabilidad que tratarías a un amigo es el primer paso hacia sentirte mejor.",
        actionTip: "Pon tu mano en el corazón y di: 'Este momento es difícil, pero pasará'."
      },
      {
        title: "Pequeños logros",
        category: "Productividad",
        content: "Completar tareas pequeñas genera dopamina y sensación de logro, lo cual puede mejorar gradualmente tu estado de ánimo.",
        actionTip: "Elige una tarea muy pequeña y complétala: ordenar algo, enviar un mensaje pendiente."
      }
    ]
  },
  anxious: {
    cards: [
      {
        title: "Técnica 5-4-3-2-1",
        category: "Mindfulness",
        content: "Esta técnica de grounding te ayuda a volver al presente: identifica 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas.",
        actionTip: "Practica esta técnica ahora mismo, tomándote tu tiempo con cada sentido."
      },
      {
        title: "Escribe tus preocupaciones",
        category: "Hábitos",
        content: "Externalizar los pensamientos ansiosos en papel reduce su poder sobre ti y te permite verlos con más objetividad.",
        actionTip: "Escribe lo que te preocupa y pregúntate: ¿Qué puedo controlar de esto?"
      },
      {
        title: "Límites de información",
        category: "Filosofía",
        content: "El exceso de información puede alimentar la ansiedad. Establecer límites con noticias y redes sociales protege tu paz mental.",
        actionTip: "Considera tomar un descanso de 30 minutos de tu teléfono."
      }
    ]
  },
  stressed: {
    cards: [
      {
        title: "Priorización radical",
        category: "Productividad",
        content: "Cuando todo parece urgente, nada lo es realmente. Identifica las 1-3 cosas que realmente importan hoy y enfócate solo en esas.",
        actionTip: "Escribe las 3 cosas más importantes para hoy. Tacha todo lo demás."
      },
      {
        title: "Pausa estratégica",
        category: "Mindfulness",
        content: "Paradójicamente, detenerte cuando estás estresado te hace más productivo. Un descanso de 10 minutos puede resetear tu mente.",
        actionTip: "Aléjate de lo que estás haciendo por 10 minutos. Sal, respira, estira."
      },
      {
        title: "Perspectiva temporal",
        category: "Filosofía",
        content: "Los estoicos preguntaban: '¿Importará esto en 5 años?' La mayoría de nuestros estreses actuales son temporales.",
        actionTip: "Pregúntate: ¿Qué tan importante será esto la próxima semana?"
      }
    ]
  },
  frustrated: {
    cards: [
      {
        title: "Canaliza la energía",
        category: "Hábitos",
        content: "La frustración es energía que puede redirigirse. El ejercicio físico o actividades manuales pueden transformar esa tensión en algo productivo.",
        actionTip: "Haz 20 sentadillas o sal a caminar rápido por 5 minutos."
      },
      {
        title: "Reformula el obstáculo",
        category: "Filosofía",
        content: "Marco Aurelio decía: 'El obstáculo es el camino'. Cada frustración contiene una lección o una oportunidad de crecimiento.",
        actionTip: "Pregúntate: ¿Qué puedo aprender de esta situación?"
      },
      {
        title: "Comunicación asertiva",
        category: "Productividad",
        content: "Si la frustración involucra a otros, expresar tus necesidades de forma clara y respetuosa es más efectivo que guardarlo.",
        actionTip: "Usa la fórmula: 'Cuando [situación], me siento [emoción], necesito [petición]'."
      }
    ]
  }
};

async function generateWellnessTips(mood) {
  const normalizedMood = mood?.toLowerCase() || 'neutral';

  const prompt = `Genera 3 tarjetas de bienestar y productividad personalizadas para alguien que se siente: ${normalizedMood}.

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
    console.error('Error generating tips, using fallback:', error.message);
    // Return fallback tips based on mood
    return FALLBACK_TIPS[normalizedMood] || FALLBACK_TIPS.neutral;
  }
}

module.exports = {
  generateRoutine,
  analyzeIngredients,
  generateRecipe,
  chatTherapist,
  generateWellnessTips
};
