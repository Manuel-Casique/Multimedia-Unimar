<?php

// Verificar si cURL está habilitado
if (!function_exists('curl_init')) {
    die("cURL no está habilitado en PHP\n");
}

echo "cURL está habilitado ✓\n\n";

// Test directo a Gemini API - CORRECTO
$apiKey = trim(file_get_contents(__DIR__ . '/.env.apikey'));
if (empty($apiKey) || strlen($apiKey) < 10) {
    die("API Key inválida. Crea un archivo .env.apikey con tu GEMINI_API_KEY\n");
}

// LA CLAVE: v1beta no usa "models/" en la URL, solo el nombre del modelo
$model = 'gemini-1.5-flash';
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

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

echo "Request body:\n" . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($error) {
    echo "cURL Error: $error\n";
}
echo "\nResponse:\n";
if ($httpCode == 200) {
    $json = json_decode($response, true);
    if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
        echo "\n✓✓✓ ¡FUNCIONA! ✓✓✓\n\n";
        echo "Texto mejorado:\n" . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
    } else {
        print_r($json);
    }
} else {
    echo $response . "\n";
}
