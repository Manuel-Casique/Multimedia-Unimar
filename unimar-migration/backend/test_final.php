<?php

$apiKey = 'AIzaSyBP5beCM0tC2dBJucLYYnRz8zcevYGFxpU';

// Probar con el nombre COMPLETO del modelo como espera la API
// La API espera "models/gemini-1.5-flash" en la URL base

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}";

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
        echo "Respuesta:\n";
        print_r($json);
    }
} else {
    echo "Error HTTP $httpCode\n";
    $json = json_decode($response, true);
    print_r($json);
}
