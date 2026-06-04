export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const a = req.body;

  const prompt = `Sos un experto en cine y series con conocimiento del mercado argentino y las plataformas disponibles en Argentina.

El usuario respondió:
- Estado de ánimo: ${a.mood || '-'}
- Quiere sentir: ${(a.feeling || []).join(', ') || '-'}
- Lo último que vio: ${a.last_watched_text || '-'}
- ¿Le gustó?: ${a.last_watched_sub || '-'}
- Compañía: ${a.company || '-'}
- Nuevo o clásico: ${a.new_or_classic || '-'}
- Origen: ${a.origin || '-'}
- Formato: ${(a.format || []).join(', ') || '-'}
- Plataformas: ${(a.platforms || []).join(', ') || '-'}

Recomendá exactamente 4 títulos disponibles en esas plataformas en Argentina. Para cada uno incluí:
- title
- year
- type (Película / Serie / Miniserie / Documental)
- platform
- why: 2 oraciones personales explicando por qué se lo recomendás en base a SUS respuestas

Respondé SOLO en JSON válido sin markdown ni backticks:
{"recommendations":[{"title":"","year":"","type":"","platform":"","why":""},{"title":"","year":"","type":"","platform":"","why":""},{"title":"","year":"","type":"","platform":"","why":""},{"title":"","year":"","type":"","platform":"","why":""}]}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'Error consultando la IA' });
  }
}
