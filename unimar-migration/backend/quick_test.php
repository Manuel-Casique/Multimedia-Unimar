<?php

$apiKey = 'AIzaSyAdVBQSr73PCcsHIlCXBJPCwgrPvYWv9Wk';

echo "Probando API key después de billing...\n\n";

$model = 'gemini-1.5-flash';
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => 'Mejora este texto: hola manuel como estas espero que bien']
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
        echo "✅✅✅ ¡¡¡FUNCIONA!!! ✅✅✅\n\n";
        echo "Texto mejorado:\n" . $json['candidates'][0]['content']['parts'][0]['text'] . "\n\n";
        echo "ACTUALIZA TU .ENV:\nGEMINI_API_KEY=$apiKey\n";
    }
} else {
    echo "❌ Error HTTP $httpCode\n";
    $json = json_decode($response, true);
    if ($json) {
        print_r($json);
    }
}
