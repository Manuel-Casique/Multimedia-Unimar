<?php

$apiKey = 'AIzaSyCT0LwPgMuZ76qqURG96P6wZ7lPdcg46GU';

echo "🔄 PROBANDO DESPUÉS DE ACTIVAR BILLING\n\n";

$model = 'gemini-1.5-flash';
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => 'Mejora este texto: hola manuel como estas espero que bien estamos probando la inteligencia artificial']
            ]
        ]
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n\n";

if ($httpCode == 200) {
    $json = json_decode($response, true);
    if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "✅✅✅ ¡¡¡FUNCIONA!!! EL BILLING ERA EL PROBLEMA ✅✅✅\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        echo "📝 Texto mejorado:\n";
        echo $json['candidates'][0]['content']['parts'][0]['text'] . "\n\n";
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "SIGUIENTE PASO:\n";
        echo "Actualiza tu .env con esta key:\n";
        echo "GEMINI_API_KEY=$apiKey\n\n";
        echo "Luego ejecuta: php test_ai.php\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    }
} else {
    echo "❌ Aún no funciona (HTTP $httpCode)\n\n";
    
    $json = json_decode($response, true);
    if ($json && isset($json['error'])) {
        echo "Error:\n";
        echo "  Código: " . ($json['error']['code'] ?? 'N/A') . "\n";
        echo "  Estado: " . ($json['error']['status'] ?? 'N/A') . "\n";
        echo "  Mensaje: " . ($json['error']['message'] ?? 'N/A') . "\n\n";
        
        // Si sigue fallando, dar instrucciones
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "INSTRUCCIONES PASO A PASO:\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        echo "1. Ve a: https://console.cloud.google.com/\n\n";
        echo "2. En la esquina superior izquierda, verifica qué proyecto\n";
        echo "   está seleccionado (debe ser el que tiene billing activo)\n\n";
        echo "3. Ve al menú ≡ → APIs & Services → Credentials\n\n";
        echo "4. Click en '+ CREATE CREDENTIALS' → 'API key'\n\n";
        echo "5. INMEDIATAMENTE después de crear la key:\n";
        echo "   - Click en 'RESTRICT KEY'\n";
        echo "   - En 'Application restrictions' → NONE\n";
        echo "   - En 'API restrictions' → Restrict key\n";
        echo "   - Selecciona SOLO: 'Generative Language API'\n";
        echo "   - Click 'SAVE'\n\n";
        echo "6. Copia la key y dame la nueva key para probar\n\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    } else {
        echo "Response: $response\n";
    }
}
