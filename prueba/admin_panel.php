<?php
// admin_panel.php
session_start();

if (!isset($_SESSION['usuario'])) {
    header('Location: login.php');
    exit;
}

$rol = $_SESSION['usuario']['rol'];
if ($rol !== 'admin' && $rol !== 'editor') {
    header('Location: panel_usuario.php'); 
    exit;
}

$page = $_GET['page'] ?? 'home';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Panel de Administrador</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
    <link rel="shortcut icon" href="https://portalunimar.unimar.edu.ve/image/unimar.ico" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.2.0/dist/css/adminlte.min.css" />
    <link rel="stylesheet" href="admin.css" />
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" />
</head>
<body class="sidebar-mini sidebar-collapse">

<div class="wrapper">

    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand navbar-blue-u">
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
            </li>
        </ul>
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">
                <div class="user-panel d-flex align-items-center">
                    <div class="info ml-2">
                        <a class="loginuser" href="admin_panel.php">
                            <?php echo htmlspecialchars($_SESSION['usuario']['apellido']) . ', ' . htmlspecialchars($_SESSION['usuario']['nombre']); ?>
                        </a>
                    </div>
                </div>
            </li>
        </ul>
    </nav>

    <!-- Sidebar -->
    <aside class="main-sidebar sidebar-light-primary elevation-4">
        <a href="./MMU.PHP" class="brand-link d-flex align-items-center">
            <img src="https://portalunimar.unimar.edu.ve/image/logo-unimar-127.png" 
                 alt="UNIMAR logo" 
                 class="brand-image img-circle" 
                 style="opacity: .8; width: 40px; height: 40px; object-fit: contain;">
            <span class="brand-text font-weight-light ms-2">
                <img src="https://portalunimar.unimar.edu.ve/image/texto-unimar.jpg" 
                     alt="Texto UNIMAR" 
                     style="height: 25px; object-fit: contain;">
            </span>
        </a>
        <div class="sidebar">
            <nav class="mt-2">
                <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
                    <li class="nav-item">
                        <a href="admin_panel.php?page=agregar-publicacion" class="nav-link <?= ($page === 'agregar-publicacion') ? 'active' : '' ?>">
                            <i class="nav-icon fas fa-plus-square"></i>
                            <p>Agregar Publicación</p>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="admin_panel.php?page=ver-publicaciones" class="nav-link <?= ($page === 'ver-publicaciones') ? 'active' : '' ?>">
                            <i class="nav-icon fas fa-table"></i>
                            <p>Ver Publicaciones</p>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="./FPHP/logout.php" class="nav-link">
                            <i class="nav-icon fas fa-sign-out-alt"></i>
                            <p>Cerrar Sesión</p>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </aside>

    <!-- Content Wrapper -->
    <div class="content-wrapper p-3">
        <?php
            if ($page === 'agregar-publicacion') {
                include 'formulario.php';
            } elseif ($page === 'ver-publicaciones') {
                include 'ver_publicaciones.php';
            } elseif ($page === 'editar-publicacion' && isset($_GET['id'])) {
                include 'editar_publicacion.php';
            } else {
                $nombre = htmlspecialchars($_SESSION['usuario']['nombre']);
                $rol = htmlspecialchars($_SESSION['usuario']['rol']);
                echo "<h2>¡Bienvenid@ $rol $nombre al panel de administración!</h2>";
            }
        ?>
    </div>

    <footer class="main-footer text-center">
        <p>© Copyright 2001-2025 Universidad de Margarita, Rif: J-30660040-0. Teléfono: 800-UNIMAR (800-864627). Isla de Margarita - Venezuela.</p>
    </footer>

</div>

<!-- Scripts JS al final para mejor carga -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/admin-lte@3.2.0/dist/js/adminlte.min.js"></script>
</body>
</html>