<?php

$envContent = file_get_contents(__DIR__ . '/.env');
preg_match('/GEMINI_API_KEY=(.+)/', $envContent, $matches);
$apiKey = trim($matches[1] ?? '');

echo "Listando modelos DISPONIBLES para tu cuenta:\n\n";

$url = "https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    $json = json_decode($response, true);
    
    if (isset($json['models'])) {
        echo "Modelos disponibles:\n";
        foreach ($json['models'] as $model) {
            $name = $model['name'] ?? 'Unknown';
            $displayName = $model['displayName'] ?? '';
            $methods = $model['supportedGenerationMethods'] ?? [];
            
            if (in_array('generateContent', $methods)) {
                echo "  ✅ $name - $displayName\n";
            }
        }
        
        // Proe con el primer modelo disponible
        echo "\n\nProbando con el primer modelo que soporte generateContent...\n\n";
        
        foreach ($json['models'] as $model) {
            $methods = $model['supportedGenerationMethods'] ?? [];
            if (in_array('generateContent', $methods)) {
                $modelName = $model['name'];
                
                echo "Usando: $modelName\n";
                
                $genUrl = "https://generativelanguage.googleapis.com/v1beta/{$modelName}:generateContent?key={$apiKey}";
                $data = ['contents' => [['parts' => [['text' => 'Mejora este texto: hola manuel']]]]];
                
                $ch2 = curl_init($genUrl);
                curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch2, CURLOPT_POST, true);
                curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($data));
                curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
                
                $response2 = curl_exec($ch2);
                $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
                curl_close($ch2);
                
                echo "HTTP Code: $httpCode2\n\n";
                
                if ($httpCode2 == 200) {
                    $result = json_decode($response2, true);
                    if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
                        echo "🎉 ¡FUNCIONA!\n";
                        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
                        echo "Texto mejorado:\n" . $result['candidates'][0]['content']['parts'][0]['text'] . "\n\n";
                        
                        // Extraer solo el nombre del modelo sin el prefijo "models/"
                        $shortName = str_replace('models/', '', $modelName);
                        
                        echo "ACTUALIZA TU .ENV:\n";
                        echo "GEMINI_MODEL=$shortName\n\n";
                    }
                    break;
                } else {
                    $err = json_decode($response2, true);
                    echo "Error: " . ($err['error']['message'] ?? $err['error']['status'] ?? 'Unknown') . "\n\n";
                    
                    if ($httpCode2 == 429) {
                        echo "⏳ Cuota agotada, probando siguiente modelo...\n\n";
                        continue;
                    }
                }
            }
        }
    }
} else {
    echo "Error listando modelos: HTTP $httpCode\n";
}
