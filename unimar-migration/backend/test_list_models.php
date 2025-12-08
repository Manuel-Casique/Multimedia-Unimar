<?php

$apiKey = 'AIzaSyCT0LwPgMuZ76qqURG96P6wZ7lPdcg46GU';

echo "Probando endpoint de LISTAR MODELOS (más simple):\n\n";

// Endpoint para listar modelos disponibles
$url = "https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}";

echo "URL: $url\n\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n\n";

if ($httpCode == 200) {
    $json = json_decode($response, true);
    
    echo "✅ La API key FUNCIONA!\n\n";
    
    if (isset($json['models'])) {
        echo "Modelos disponibles para tu cuenta:\n";
        foreach ($json['models'] as $model) {
            $name = $model['name'] ?? 'Unknown';
            $displayName = $model['displayName'] ?? '';
            echo "  - $name ($displayName)\n";
        }
        
        // Ahora probar con el primer modelo que funcione
        if (count($json['models']) > 0) {
            $firstModel = $json['models'][0]['name'];
            echo "\n\nProbando generateContent con: $firstModel\n";
            
            $genUrl = "https://generativelanguage.googleapis.com/v1beta/{$firstModel}:generateContent?key={$apiKey}";
            $data = ['contents' => [['parts' => [['text' => 'Hola']]]]];
            
            $ch2 = curl_init($genUrl);
            curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch2, CURLOPT_POST, true);
            curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
            
            $response2 = curl_exec($ch2);
            $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
            curl_close($ch2);
            
            echo "HTTP Code: $httpCode2\n";
            
            if ($httpCode2 == 200) {
                echo "\n✅✅✅ ¡FUNCIONA! ✅✅✅\n";
                $result = json_decode($response2, true);
                if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                    echo "Respuesta: " . $result['candidates'][0]['content']['parts'][0]['text'] . "\n";
                }
            } else {
                echo "Error: $httpCode2\n";
                echo "Response: " . substr($response2, 0, 500) . "\n";
            }
        }
    }
} else {
    echo "❌ Error HTTP $httpCode\n";
    $json = json_decode($response, true);
    if ($json && isset($json['error'])) {
        echo "\nError:\n";
        echo "  Mensaje: " . ($json['error']['message'] ?? 'N/A') . "\n";
        echo "  Estado: " . ($json['error']['status'] ?? 'N/A') . "\n";
        
        if (strpos($json['error']['message'] ?? '', 'API key') !== false) {
            echo "\n⚠️ La API key tiene restricciones.\n";
            echo "Ve a Google Cloud Console → Credentials → Edita la key\n";
            echo "Y asegúrate que 'Application restrictions' = NONE\n";
        }
    } else {
        echo "Response: $response\n";
    }
}
