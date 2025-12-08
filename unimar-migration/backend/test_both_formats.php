<?php

$apiKey = 'AIzaSyDOhgN5eaneSdjfkAFw0t6TgSt47SByTao';

echo "Probando AMBOS formatos (con y sin /models/):\n\n";

// Formato 1: SIN /models/ (como mencionó el usuario)
echo "1. SIN /models/:\n";
$url1 = "https://generativelanguage.googleapis.com/v1beta/gemini-1.5-flash:generateContent?key={$apiKey}";
echo "URL: $url1\n";

$data = ['contents' => [['parts' => [['text' => 'Hola']]]]];

$ch = curl_init($url1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($httpCode == 200) {
    echo "✓✓✓ FUNCIONA!\n";
} else {
    $err = json_decode($response, true);
    echo "Error: " . ($err['error']['message'] ?? 'Unknown') . "\n";
}

echo "\n";

// Formato 2: CON /models/
echo "2. CON /models/:\n";
$url2 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}";
echo "URL: $url2\n";

$ch = curl_init($url2);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($httpCode == 200) {
    echo "✓✓✓ FUNCIONA!\n";
    $json = json_decode($response, true);
    if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
        echo "\nRespuesta de Gemini:\n" . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
    }
} else {
    $err = json_decode($response, true);
    echo "Error: " . ($err['error']['message'] ?? 'Unknown') . "\n";
}
