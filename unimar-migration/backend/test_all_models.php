<?php

$apiKey = 'AIzaSyBP5beCM0tC2dBJucLYYnRz8zcevYGFxpU';

// Probar diferentes nombres de modelo
$modelos = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'models/gemini-1.5-flash',  // Con prefijo explícito
];

foreach ($modelos as $model) {
    echo "\n=== Probando: $model ===\n";
    
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
    
    $data = ['contents' => [['parts' => [['text' => 'Hola']]]]];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        echo "✓✓✓ ¡FUNCIONA!\n";
        $json = json_decode($response, true);
        if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
            echo "Respuesta: " . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
        }
        break; // Si funciona uno, usar ese
    } else {
        $json = json_decode($response, true);
        echo "Error: " . ($json['error']['message'] ?? 'Unknown') . "\n";
    }
}
