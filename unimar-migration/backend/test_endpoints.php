<?php

echo "=== PROBANDO DIFERENTES ENDPOINTS ===\n\n";

$apiKey = 'AIzaSyBP5beCM0tC2dBJucLYYnRz8zcevYGFxpU';
$model = 'gemini-1.5-flash';
$data = ['contents' => [['parts' => [['text' => 'Hola']]]]];

// Probar diferentes endpoints
$endpoints = [
    'v1beta' => "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent",
    'v1' => "https://generativelanguage.googleapis.com/v1/models/{$model}:generateContent",
    'v1beta-alt' => "https://generativelanguage.googleapis.com/v1beta/{$model}:generateContent",
];

foreach ($endpoints as $label => $baseUrl) {
    $url = $baseUrl . "?key={$apiKey}";
    
    echo "Probando $label:\n";
    echo "URL: $url\n";
    
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
        echo "✓✓✓ ¡ESTE FUNCIONA! ✓✓✓\n";
        $json = json_decode($response, true);
        if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
            echo "Respuesta: " . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
        }
        break;
    } else {
        $error = json_decode($response, true);
        echo "Error: " . ($error['error']['message'] ?? 'Unknown') . "\n";
    }
    
    echo "\n";
}
