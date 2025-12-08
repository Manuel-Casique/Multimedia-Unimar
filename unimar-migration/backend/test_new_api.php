<?php

$apiKey = 'AIzaSyAdVBQSr73PCcsHIlCXBJPCwgrPvYWv9Wk';

echo "Probando NUEVA API KEY\n";
echo "Key: $apiKey\n\n";

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
        echo "✅✅✅ ¡¡¡LA INTELIGENCIA ARTIFICIAL FUNCIONA!!! ✅✅✅\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        echo "📝 Texto original:\n";
        echo "   hola manuel como estas espero que bien estamos probando\n";
        echo "   la inteligencia artificial\n\n";
        
        echo "✨ Texto mejorado por Gemini:\n";
        echo "   " . $json['candidates'][0]['content']['parts'][0]['text'] . "\n\n";
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "🎉 ¡EL SISTEMA DE IA ESTÁ LISTO!\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        echo "Ahora actualiza tu .env con esta API key:\n";
        echo "GEMINI_API_KEY=$apiKey\n";
    } else {
        print_r($json);
    }
} else {
    echo "❌ Error HTTP $httpCode\n\n";
    $json = json_decode($response, true);
    if ($json && isset($json['error'])) {
        echo "Detalles del error:\n";
        echo "  Código: " . ($json['error']['code'] ?? 'N/A') . "\n";
        echo "  Estado: " . ($json['error']['status'] ?? 'N/A') . "\n";
        echo "  Mensaje: " . ($json['error']['message'] ?? 'N/A') . "\n";
    } else {
        echo "Response:\n$response\n";
    }
}
