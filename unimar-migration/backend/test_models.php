<?php

$apiKey = 'AIzaSyDOhgN5eaneSdjfkAFw0t6TgSt47SByTao';

echo "Probando DIFERENTES MODELOS disponibles:\n\n";

$modelos = [
    'gemini-pro' => 'Modelo original (más antiguo, siempre disponible)',
    'gemini-1.5-flash' => 'Modelo nuevo (puede no estar disponible en tu región)',
    'gemini-1.5-pro' => 'Modelo Pro nuevo',
];

$data = ['contents' => [['parts' => [['text' => '¡Hola!']]]]];

foreach ($modelos as $modelo => $desc) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Modelo: $modelo\n";
    echo "Descripción: $desc\n";
    
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelo}:generateContent?key={$apiKey}";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        $json = json_decode($response, true);
        if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
            echo "\n✅ ¡¡¡ESTE MODELO FUNCIONA!!!\n";
            echo "Respuesta: " . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
            echo "\n🎉 USA ESTE MODELO: $modelo\n";
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
            
            echo "Para usar este modelo, actualiza tu .env:\n";
            echo "GEMINI_MODEL=$modelo\n\n";
            break;
        }
    } else {
        $json = json_decode($response, true);
        $error = $json['error']['message'] ?? $json['error']['status'] ?? 'Unknown';
        echo "❌ Error: $error\n";
    }
    
    echo "\n";
}
