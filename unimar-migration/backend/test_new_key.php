<?php

$apiKey = 'AIzaSyBP5beCM0tC2dBJucLYYsDX9xVLn-wSR9hH73K35JY'; // Nueva key
$model = 'gemini-1.5-flash';
$url = "https://generativelanguage.googleapis.com/v1beta/{$model}:generateContent?key={$apiKey}";

echo "Probando con NUEVA API KEY...\n";
echo "URL: $url\n\n";

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
        echo "✓✓✓ ¡¡¡LA IA FUNCIONA!!! ✓✓✓\n\n";
        echo "Texto original:\nhola manuel como estas espero que bien estamos probando la inteligencia artificial\n\n";
        echo "Texto mejorado por Gemini:\n" . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
    } else {
        echo "Respuesta:\n";
        print_r($json);
    }
} else {
    echo "Error HTTP $httpCode\n";
    echo "Response:\n$response\n";
}
