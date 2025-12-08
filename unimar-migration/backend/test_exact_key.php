<?php

// API key EXACTA del usuario desde Google AI Studio
$apiKey = 'AIzaSyDOhgN5eaneSdjfkAFw0t6TgSt47SByTao';

echo "Probando con la API key exacta de Google AI Studio\n";
echo "Key: $apiKey\n";
echo "Longitud: " . strlen($apiKey) . " caracteres\n\n";

// Probar AMBOS formatos
$tests = [
    'CON /models/' => "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    'SIN /models/' => "https://generativelanguage.googleapis.com/v1beta/gemini-1.5-flash:generateContent",
];

$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => '¡Hola! ¿Cómo estás?']
            ]
        ]
    ]
];

foreach ($tests as $label => $baseUrl) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Probando: $label\n";
    echo "URL: $baseUrl\n\n";
    
    $url = $baseUrl . "?key={$apiKey}";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    
    if ($curlError) {
        echo "cURL Error: $curlError\n";
    }
    
    if ($httpCode == 200) {
        $json = json_decode($response, true);
        if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
            echo "\n✅ ¡¡¡FUNCIONA CON ESTE FORMATO!!!\n\n";
            echo "Respuesta de Gemini:\n";
            echo $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
            
            echo "\n🎉 LA IA ESTÁ FUNCIONANDO 🎉\n";
            break;
        }
    } else {
        $json = json_decode($response, true);
        if ($json && isset($json['error'])) {
            echo "\n❌ Error:\n";
            echo "  Código: " . ($json['error']['code'] ?? 'N/A') . "\n";
            echo "  Estado: " . ($json['error']['status'] ?? 'N/A') . "\n";
            echo "  Mensaje: " . ($json['error']['message'] ?? 'N/A') . "\n";
        } else {
            echo "\nResponse: $response\n";
        }
    }
    
    echo "\n";
}
