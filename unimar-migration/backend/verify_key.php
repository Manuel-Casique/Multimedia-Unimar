<?php

echo "=== VERIFICACIÓN DE API KEY ===\n\n";

$apiKey = 'AIzaSyBP5beCM0tC2dBJucLYYnRz8zcevYGFxpU';

// Primero, intentar listar los modelos disponibles para verificar que la  API key funciona
$url = "https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}";

echo "1. Listando modelos disponibles...\n";
echo "URL: $url\n\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($httpCode == 200) {
    echo "✓ API Key es válida\n\n";
    $json = json_decode($response, true);
    
    if (isset($json['models'])) {
        echo "Modelos disponibles:\n";
        foreach ($json['models'] as $model) {
            echo "  - " . $model['name'] . "\n";
        }
        
        // Ahora probar con el modelo correcto
        echo "\n\n2. Probando generateContent con un modelo disponible...\n";
        
        // Usar el primer modelo de la lista
        if (count($json['models']) > 0) {
            $modelName = $json['models'][0]['name']; // Esto incluirá "models/gemini-..."
            echo "Usando modelo: $modelName\n";
            
            $genUrl = "https://generativelanguage.googleapis.com/v1beta/{$modelName}:generateContent?key={$apiKey}";
            
            $data = ['contents' => [['parts' => [['text' => 'Hola, ¿cómo estás?']]]]];
            
            $ch = curl_init($genUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch,CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            $response2 = curl_exec($ch);
            $httpCode2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            echo "HTTP Code: $httpCode2\n";
            
            if ($httpCode2 == 200) {
                echo "\n✓✓✓ ¡FUNCIONA! ✓✓✓\n\n";
                $result = json_decode($response2, true);
                if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                    echo "Respuesta de Gemini:\n";
                    echo $result['candidates'][0]['content']['parts'][0]['text'] . "\n";
                }
            } else {
                echo "Error en generateContent\n";
                echo "Response: $response2\n";
            }
        }
    }
} else {
    echo "✗ API Key inválida o error de conexión\n";
    echo "Response: $response\n";
}
