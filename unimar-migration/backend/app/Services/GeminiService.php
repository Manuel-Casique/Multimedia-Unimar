<?php

namespace App\Services;

class GeminiService
{
    protected $apiKey;
    protected $modelName;
    protected $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->modelName = config('services.gemini.model', 'gemini-1.5-flash');
        // URL correcta: Google API espera /models/ antes del nombre del modelo
        $this->apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' . $this->modelName . ':generateContent';
    }

    /**
     * Método base para generar texto usando cURL
     */
    private function generateText(string $prompt): string
    {
        $url = $this->apiUrl . '?key=' . $this->apiKey;
        
        $data = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'maxOutputTokens' => (int) config('services.gemini.max_tokens', 2048),
                'temperature' => 0.7,
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            \Log::error('Gemini API Error', ['response' => $response, 'code' => $httpCode]);
            throw new \Exception('Error al comunicarse con Gemini API (HTTP ' . $httpCode . ')');
        }

        $result = json_decode($response, true);
        
        if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            return $result['candidates'][0]['content']['parts'][0]['text'];
        }

        throw new \Exception('Respuesta inesperada de Gemini API');
    }

    /**
     * Mejorar texto seleccionado
     */
    public function improveText(string $text): string
    {
        $prompt = <<<PROMPT
Mejora el siguiente texto corrigiendo gramática, ortografía y estilo.
Mantén el significado original y el tono profesional.
No agregues información nueva, solo mejora lo existente.

Texto a mejorar:
{$text}

Responde SOLO con el texto mejorado, sin explicaciones adicionales.
PROMPT;

        return $this->generateText($prompt);
    }

    /**
     * Cambiar el tono del texto
     */
    public function changeTone(string $text, string $tone): string
    {
        $toneDescriptions = [
            'formal'       => 'formal, profesional y respetuoso',
            'casual'       => 'casual, amigable y cercano',
            'academico'    => 'académico, riguroso y con vocabulario técnico',
            'periodistico' => 'periodístico, informativo y objetivo',
        ];

        $toneDesc = $toneDescriptions[$tone] ?? 'formal, profesional y respetuoso';

        $prompt = <<<PROMPT
Reescribe el siguiente texto cambiando su tono a uno {$toneDesc}.
Mantén el mismo significado y toda la información original.
No agregues ni elimines información, solo cambia el tono y estilo de escritura.

Texto original:
{$text}

Responde SOLO con el texto reescrito, sin explicaciones adicionales.
PROMPT;

        return $this->generateText($prompt);
    }

    /**
     * Corregir errores ortográficos y gramaticales
     */
    public function fixSpelling(string $text): string
    {
        $prompt = <<<PROMPT
Corrige TODOS los errores ortográficos y gramaticales del siguiente texto en español.
NO cambies el estilo, tono ni significado. Solo corrige errores de:
- Ortografía (tildes, letras incorrectas)
- Gramática (concordancia, conjugaciones)
- Puntuación (comas, puntos)

Texto a corregir:
{$text}

Responde SOLO con el texto corregido, sin explicaciones adicionales.
PROMPT;

        return $this->generateText($prompt);
    }

    /**
     * Generar títulos desde contenido
     */
    public function generateTitles(string $content): array
    {
        $prompt = <<<PROMPT
Genera 3 títulos atractivos, profesionales y SEO-friendly para el siguiente contenido.
Los títulos deben ser concisos (máximo 60 caracteres) y captar la atención.

Contenido:
{$content}

Responde SOLO con los 3 títulos, uno por línea, sin numeración ni explicaciones.
PROMPT;

        $response = $this->generateText($prompt);
        $titles = array_filter(array_map('trim', explode("\n", $response)));

        return array_slice($titles, 0, 3);
    }

    /**
     * Generar resumen
     */
    public function generateSummary(string $content, int $maxWords = 150): string
    {
        $prompt = <<<PROMPT
Genera un resumen profesional y conciso del siguiente contenido.
El resumen debe tener máximo {$maxWords} palabras.
Enfócate en los puntos clave y mantén un tono académico.

Contenido:
{$content}

Responde SOLO con el resumen, sin introducción ni conclusión adicional.
PROMPT;

        return $this->generateText($prompt);
    }

    /**
     * Optimizar SEO
     */
    public function optimizeSEO(string $title, string $content): array
    {
        $prompt = <<<PROMPT
Analiza el siguiente contenido y genera metadatos SEO optimizados.

Título: {$title}
Contenido: {$content}

Genera:
1. Meta title optimizado (máximo 60 caracteres)
2. Meta description atractiva (máximo 160 caracteres)
3. 5 keywords relevantes separadas por comas

Responde en formato JSON exactamente así:
{
  "meta_title": "...",
  "meta_description": "...",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
PROMPT;

        $response = $this->generateText($prompt);
        
        $response = str_replace(['```json', '```'], '', $response);
        $json = json_decode($response, true);

        if (!$json) {
            return [
                'meta_title' => substr($title, 0, 60),
                'meta_description' => substr($content, 0, 160),
                'keywords' => [],
            ];
        }

        return $json;
    }

    /**
     * Expandir idea
     */
    public function expandIdea(string $idea): string
    {
        $prompt = <<<PROMPT
Expande la siguiente idea en un párrafo bien desarrollado (150-200 palabras).
Mantén un tono profesional y académico.

Idea:
{$idea}

Responde SOLO con el párrafo expandido.
PROMPT;

        return $this->generateText($prompt);
    }

    /**
     * Sugerir siguiente bloque
     */
    public function suggestNextBlock(array $existingBlocks): array
    {
        $context = $this->buildContextFromBlocks($existingBlocks);

        $prompt = <<<PROMPT
Basándote en el siguiente contenido de una publicación, sugiere:
1. Qué tipo de bloque sería apropiado agregar a continuación (text, image, video)
2. Una breve justificación (1 línea)

Contenido actual:
{$context}

Responde en formato JSON:
{
  "suggested_type": "text|image|video",
  "reason": "Breve justificación"
}
PROMPT;

        $response = $this->generateText($prompt);
        $response = str_replace(['```json', '```'], '', $response);
        $json = json_decode($response, true);

        return $json ?? [
            'suggested_type' => 'text',
            'reason' => 'Continuar con más contenido textual',
        ];
    }

    private function buildContextFromBlocks(array $blocks): string
    {
        $context = '';

        foreach ($blocks as $index => $block) {
            $num = $index + 1;
            $type = $block['type'];

            if ($type === 'text') {
                $text = $block['content']['plain_text'] ?? '';
                $context .= "Bloque {$num} [TEXTO]: " . substr($text, 0, 200) . "...\n";
            } elseif ($type === 'image') {
                $caption = $block['content']['caption'] ?? 'Sin descripción';
                $context .= "Bloque {$num} [IMAGEN]: {$caption}\n";
            } elseif ($type === 'video') {
                $caption = $block['content']['caption'] ?? 'Sin descripción';
                $context .= "Bloque {$num} [VIDEO]: {$caption}\n";
            }
        }

        return $context ?: 'No hay bloques aún';
    }

    /**
     * Método para generar texto a partir de un texto y una imagen (Multimodal)
     */
    private function generateTextWithImage(string $prompt, string $imagePath, string $mimeType): string
    {
        $url = $this->apiUrl . '?key=' . $this->apiKey;
        
        $imageData = base64_encode(file_get_contents($imagePath));

        $data = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        [
                            'inlineData' => [
                                'mimeType' => $mimeType,
                                'data' => $imageData
                            ]
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'maxOutputTokens' => (int) config('services.gemini.max_tokens', 2048),
                'temperature' => 0.7,
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            \Log::error('Gemini Multimodal API Error', ['response' => $response, 'code' => $httpCode]);
            throw new \Exception('Error al comunicarse con Gemini API (HTTP ' . $httpCode . ')');
        }

        $result = json_decode($response, true);
        
        if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            return $result['candidates'][0]['content']['parts'][0]['text'];
        }

        throw new \Exception('Respuesta inesperada de Gemini API');
    }

    /**
     * Generar título y descripción para un Media Asset usando IA.
     * Los tags ya NO son responsabilidad de la IA — se gestionan desde el catálogo controlado.
     */
    public function generateTitleAndDescription(string $title, ?string $imagePath = null, ?string $mimeType = null, string $description = ''): array
    {
        $contextText = "Título Original: {$title}\n";
        if (!empty($description)) {
            $contextText .= "Descripción Original: {$description}\n";
        }

        $prompt = <<<PROMPT
Actúa como un catalogador experto de medios visuales para una universidad.
A continuación, analizarás los metadatos base y (si se proporciona) la imagen visual adjunta.

Tu objetivo es generar:
1. Un 'title': título corto, descriptivo y profesional (máximo 60 caracteres).
2. Un 'description': texto alternativo (alt text) para accesibilidad, describe literalmente lo que se ve en la imagen con un tono objetivo (máximo 180 caracteres).

Datos proporcionados:
{$contextText}

Responde ÚNICAMENTE en formato JSON así, sin explicaciones adicionales:
{
  "title": "...",
  "description": "..."
}
PROMPT;

        try {
            if ($imagePath && file_exists($imagePath) && $mimeType) {
                $response = $this->generateTextWithImage($prompt, $imagePath, $mimeType);
            } else {
                $response = $this->generateText($prompt);
            }

            $response = str_replace(['```json', '```'], '', trim($response));
            $json = json_decode($response, true);

            if (is_array($json)) {
                return [
                    'title'       => $json['title'] ?? '',
                    'description' => $json['description'] ?? '',
                ];
            }
        } catch (\Exception $e) {
            \Log::error('Error generating title/description with Gemini', ['error' => $e->getMessage()]);
        }

        return [
            'title'       => '',
            'description' => '',
        ];
    }
}
