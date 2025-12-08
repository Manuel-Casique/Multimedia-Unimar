<?php
session_start();
require 'conex.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo "Debe completar todos los campos.";
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, nombre, apellido, password, rol FROM mmu.usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($password === $user['password']) { // Comparación simple
            $_SESSION['usuario'] = [
                'id' => $user['id'],
                'nombre' => $user['nombre'],
                'apellido' => $user['apellido'],
                'email' => $email,
                'rol' => $user['rol']
            ];

            header("Location: ../MMU.php");
            exit;
        } else {
            echo "<script>alert('Contraseña incorrecta'); window.location.href = '../login.php';</script>";
            exit;
        }
    } else {
        echo "<script>alert('Usuario no encontrado'); window.location.href = '../login.php';</script>";
        exit;
    }
} else {
    header("Location: ../login.php");
    exit;
}
