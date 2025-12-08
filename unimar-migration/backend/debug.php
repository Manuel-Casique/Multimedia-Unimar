<?php

$apiKey = 'AIzaSyBP5beCM0tC2dBJucLYYnRz8zcevYGFxpU';
$model = 'gemini-1.5-flash';
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

echo "=== DEBUG INFO ===\n";
echo "Model name: $model\n";
echo "Full URL: $url\n\n";

$data = ['contents' => [['parts' => [['text' => 'Hola']]]]];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
curl_close($ch);

echo "Effective URL used: $effectiveUrl\n";
echo "HTTP Code: $httpCode\n\n";
echo "Full Response:\n$response\n";
