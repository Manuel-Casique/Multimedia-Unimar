<?php

$apiKey = 'AIzaSyBP5beCM0tC2dBJucLYYnRz8zcevYGFxpU';

// Probar CON KEY EN HEADERS en lugar de query string
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

echo "Probando con API key en headers...\n";
echo "URL: $url\n\n";

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
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-goog-api-key: ' . $apiKey  // Probar con header
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n\n";

if ($httpCode == 200) {
    $json = json_decode($response, true);
    if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
        echo "✓✓✓ ¡FUNCIONA CON HEADERS! ✓✓✓\n\n";
        echo "Texto mejorado:\n" . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
    }
} else {
    echo "Error HTTP $httpCode\n";
    echo "Response:\n$response\n";
}
