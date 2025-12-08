<?php

// Leer API key del .env
$envContent = file_get_contents(__DIR__ . '/.env');
preg_match('/GEMINI_API_KEY=(.+)/', $envContent, $matches);
$apiKey = trim($matches[1] ?? '');

if (empty($apiKey)) {
    die("No se encontró GEMINI_API_KEY en .env\n");
}

echo "API Key del .env: " . substr($apiKey, 0, 20) . "...\n\n";

// Probar con gemini-2.5-flash
$model = 'gemini-2.0-flash-exp';
echo "Probando modelo: $model\n\n";

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
        echo "✅✅✅ ¡¡¡FUNCIONA CON $model!!! ✅✅✅\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        echo "Texto mejorado:\n";
        echo $json['candidates'][0]['content']['parts'][0]['text'] . "\n\n";
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "ACTUALIZA TU .ENV:\n";
        echo "GEMINI_MODEL=$model\n\n";
        echo "Luego ejecuta: php test_ai.php\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    }
} else {
    echo "❌ Error HTTP $httpCode\n\n";
    $json = json_decode($response, true);
    if ($json && isset($json['error'])) {
        echo "Error:\n";
        print_r($json['error']);
    } else {
        echo "Response: $response\n";
    }
}
