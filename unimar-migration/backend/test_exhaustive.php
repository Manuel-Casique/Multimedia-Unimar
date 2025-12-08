<?php

$apiKey = 'AIzaSyBP5beCM0tC2dBJucLYYsDX9xVLn-wSR9hH73K35JY';

echo "Probando TODAS las combinaciones posibles:\n\n";

$tests = [
    'v1beta con models/' => "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    'v1beta sin models/' => "https://generativelanguage.googleapis.com/v1beta/gemini-1.5-flash:generateContent",
    'v1 con models/' => "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
    'v1beta con models/gemini-pro' => "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
];

$data = ['contents' => [['parts' => [['text' => 'Hola']]]]];

foreach ($tests as $name => $baseUrl) {
    echo "[$name]\n";
    $url = $baseUrl . "?key={$apiKey}";
    
    $ch = curl_init($url);
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
        echo "✓✓✓ ¡ESTE FUNCIONA!\n\n";
        $json = json_decode($response, true);
        if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
            echo "Respuesta: " . $json['candidates'][0]['content']['parts'][0]['text'] . "\n";
        }
        echo "\nURL GANADORA: $baseUrl\n";
        break;
    } else {
        $json = json_decode($response, true);
        if (isset($json['error'])) {
            echo "Error: " . ($json['error']['message'] ?? $json['error']['status'] ?? 'Unknown') . "\n";
        }
    }
    echo "\n";
}
