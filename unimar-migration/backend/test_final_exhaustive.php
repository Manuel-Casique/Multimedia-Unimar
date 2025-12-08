<?php

$apiKey = 'AIzaSyCT0LwPgMuZ76qqURG96P6wZ7lPdcg46GU';

echo "ÚLTIMA PRUEBA EXHAUSTIVA:\n\n";

$endpoints = [
    'v1beta/models/gemini-1.5-flash' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'v1/models/gemini-1.5-flash' => 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
    'v1beta/models/gemini-pro' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    'v1/models/gemini-pro' => 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
];

$data = ['contents' => [['parts' => [['text' => 'Hola']]]]];

foreach ($endpoints as $name => $baseUrl) {
    echo "[$name]\n";
    $url = $baseUrl . "?key={$apiKey}";
    
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
    
    echo "HTTP: $httpCode - ";
    
    if ($httpCode == 200) {
        echo "✅ ¡FUNCIONA!\n";
        $json = json_decode($response, true);
        if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
            echo "Respuesta: " . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
        }
        echo "\n🎉 USA ESTE ENDPOINT: $baseUrl\n";
        break;
    } else {
        $json = json_decode($response, true);
        $msg = $json['error']['message'] ?? $json['error']['status'] ?? 'Unknown';
        echo "❌ $msg\n";
        
        // Detectar si es problema de billing
        if (strpos($msg, 'billing') !== false || strpos($msg, 'quota') !== false) {
            echo "\n⚠️ PROBLEMA DE FACTURACIÓN DETECTADO\n";
            echo "Ve a Google Cloud Console → Billing\n";
            echo "Y vincula una tarjeta (no te cobrarán, es gratis hasta cierto límite)\n\n";
            break;
        }
    }
    echo "\n";
}

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "Si TODOS fallaron con 404, el problema es:\n";
echo "1. API key creada en proyecto diferente al que tiene API habilitada\n";
echo "2. Necesitas habilitar billing en Google Cloud\n";
echo "3. Restricciones geográficas (Gemini no disponible en tu país)\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
