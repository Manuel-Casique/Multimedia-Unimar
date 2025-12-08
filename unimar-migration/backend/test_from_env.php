<?php

// Leer la API key DIRECTAMENTE del .env
$envContent = file_get_contents(__DIR__ . '/.env');
preg_match('/GEMINI_API_KEY=(.+)/', $envContent, $matches);
$apiKey = trim($matches[1] ?? '');

if (empty($apiKey)) {
    die("No se pudo leer GEMINI_API_KEY del .env\n");
}

echo "API Key leída del .env: " . substr($apiKey, 0, 20) . "...\n";
echo "Longitud: " . strlen($apiKey) . " caracteres\n\n";

// Probar con models/ (que dio 400)
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}";

echo "Probando con la key del .env...\n\n";

$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => 'Mejora este texto: hola manuel como estas']
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
        echo "✓✓✓ ¡¡¡FUNCIONA!!! ✓✓✓\n\n";
        echo "Texto mejorado:\n" . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
    } else {
        print_r($json);
    }
} else {
    echo "Error HTTP $httpCode\n";
    $json = json_decode($response, true);
    if ($json) {
        echo "Mensaje de error:\n";
        print_r($json);
    } else {
        echo "Response raw:\n$response\n";
    }
}
