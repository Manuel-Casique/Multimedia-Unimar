<?php
require './FPHP/conex.php';
try {
    // Obtener novedades
    $stmt = $pdo->query('SELECT * FROM vista_novedades');
    $novedades = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener últimos 4 actos de grado
    $stmtActos = $pdo->query('SELECT * FROM mmu.ultimos_actos_grado');
    $ultimosActos = $stmtActos->fetchAll(PDO::FETCH_ASSOC);

    // Obtener últimos 4 eventos
    $stmtEventos = $pdo->query('SELECT * FROM mmu.ultimos_eventos');
    $ultimosEventos = $stmtEventos->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    echo 'Error al obtener datos: ' . $e->getMessage();
    die();
}

?>

<?php
session_start();
?>



<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- Page Title -->
        <title>Portalwebunimar</title>
        <link rel="shortcut icon" href="https://portalunimar.unimar.edu.ve/image/unimar.ico">
        <!-- CSRF Token -->
        <meta name="csrf-token" content="0ZumWRdOe42UsZ3M7O3AC5NY6BKCWxRVlIfR5dDs">
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
        <!-- Font Awesome -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet">
        <!-- Google Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200&amp;display=swap" rel="stylesheet">
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200&amp;display=swap" rel="stylesheet">
        <!-- Fonts -->
        <link rel="dns-prefetch" href="//fonts.gstatic.com">
        <!-- App Styles -->
        <link rel="stylesheet" href="style.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/app.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/stylecss.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/fix.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/header.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/footer.css">
        <!-- Page Styles -->
                <!-- MDB -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.5.0/mdb.min.css" rel="stylesheet">
        <!-- App Scripts -->
        <script src="https://portalunimar.unimar.edu.ve/js/app.js" defer=""></script>
        <script src="https://portalunimar.unimar.edu.ve/js/portalunimar/header.js" defer=""></script>
        <!-- jQuery -->
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script><style type="text/css" id="operaUserStyle"></style>
        <!-- Popper.js -->
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js" integrity="sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB" crossorigin="anonymous"></script>
        <!-- Bootstrap JS -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13" crossorigin="anonymous"></script>
<body>
        <!-- Header -->
        <div class="top-bar">
    <!-- Dollar Price -->
    <marquee style="background-color: #d0e0fc; color:#0b3d91;">
        <i class="fa fa-info-circle" aria-hidden="true"></i>
         El valor del dólar, según el BCV, para el día de hoy <span>07-06-2025 es </span><strong id="dollar-bcv-price">99.09</strong>&nbsp;Bs
    </marquee>
    <!-- /.dollar-price -->

        <!-- Social Media and Others -->
    <div class="container-fluid mt-2">
        <div class="row">
            <div class="col-sm-8 col-12 header-media">
                <div class="float-right header-media-float">
                    <a class="text-reset text-decoration-none" href="mailto:info@unimar.edu.ve">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/email.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.facebook.com/share/1CJrXgVUPe/">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/facebook.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.instagram.com/universidademargarita">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/instagram.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/youtube-03.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.twitter.com/somosunimar">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/gorjeo.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.linkedin.com/company/univdemargarita">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/linkedin.png">
                    </a>
                    <a href="https://portalunimar.unimar.edu.ve/service/onlinepayment/inicio" target="_self" title="pagos-online">
                        <img src="https://portalunimar.unimar.edu.ve/./image/online-payments-vertical.png" style="height:26.5px;">
                    </a>
                </div>
            </div>
            <div class="col-sm-4 col-12 header-user">
                <div class="text-right text-truncate mx-2 header-user-button">
                    <?php if (isset($_SESSION['usuario'])): ?>
                        <a href="admin_panel.php" class="loginuser">
                            <?php 
                            echo strtoupper(
                                htmlspecialchars($_SESSION['usuario']['apellido'] . ', ' . $_SESSION['usuario']['nombre'])
                            ); 
                            ?>
                        </a>
                    <?php else: ?>
                        <a href="./login.php" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Inicia Sesión" target="_self" style="text-decoration: none;">
                            <img src="https://portalunimar.unimar.edu.ve/./image/login-vertical.png" style="height: 26.5px;">
                        </a>
                    <?php endif; ?>
                </div>
            </div>
            </div>
    </div>
    <!-- /.social-media-and-others -->

    <!-- Navigation Bar -->
    <div class="container-fluid">
        <nav class="navbar navbar-expand-md navbar-light bg-white">
            <!-- Unimar Logo -->
            <a class="navbar-brand text-dark" href="./index.php"><img class="logo horizontal-logo" id="anniversary" src="https://portalunimar.unimar.edu.ve/image/logounimar-25-aniversario.png" alt="UNIMAR logo" width="100%"></a>
            <!-- Mobile Menu -->
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#demo-navbar" aria-controls="demo-navbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="demo-navbar">
                <div class="navbar-nav ml-auto">
                    <!-- Home -->
                    <li class="nav-item px-1 active">
                        <a class="nav-link text-dark" href="./index.php">Inicio
                            <span class="sr-only">(current)</span>
                        </a>
                    </li>
                    <!-- Our Institution -->
                    <li class="nav-item px-1 dropdown">
                        <a class="nav-link dropdown-toggle" href="" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Nuestra Institución
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown2">
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/our-institution">UNIMAR</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/organization">Organización</a>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Rectorado</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/rectorate">Nuestro Subsistema</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/curricula-dir">Planificación, Desarrollo y Evaluación Insitucional</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/RRHH-department">Talento Humano</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/psychological-support">Evaluación y Apoyo Psicológico</a></li>
                                </ul>
                            </div>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Secretaría General</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/general-secretary-department">Nuestro Subsistema</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/study-control">Control de Estudios</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/student-welfare">Bienestar Estudiantil</a></li>
                                </ul>
                            </div>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/administration-dir">Administración</a>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Académico</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/academic-vicerectorate">Vicerrectorado</a></li>
                                    <li>
                                        <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/library">Biblioteca UNIMAR</a>
                                        <div class="dropdown-submenu">
                                            <a class="dropdown-item dropdown-toggle" href="#">Decanatos</a>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/general-studies-deanery">Estudios Generales</a></li>
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/humarte-deanery">Humanidades, Artes y Educación</a></li>
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/ceys-deanery">Ciencias Económicas y Sociales</a></li>
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/cjyp-deanery">Ciencias Jurídicas  y Políticas</a></li>
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/engineering-deanery">Ingeniería y Afines</a></li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Extensión</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/extension-vicerectorate">Vicerrectorado</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/community-service">Servicio Comunitario</a></li>
                                </ul>
                            </div>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/regulations">Normativas</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/university-gazette">Publicaciones Oficiales</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/electoral-commission">Comisión Electoral</a>
                        </div>
                    </li>
                    <!-- Students -->
                    <li class="nav-item px-1 dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Estudia en UNIMAR
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown2">
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Pregrado</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/new-students">Requisitos</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/undergraduate">Carreras</a></li>
                                </ul>
                            </div>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Postgrado</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/postgraduate/new-students">Requisitos</a></li>
                                </ul>
                            </div>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/extension-diploma/offers">Diplomados</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/extension-course/offers">Cursos y Talleres</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/graduate-registration">Egresados</a>
                        </div>
                    </li>
                    <!-- Postgraduate -->
                    <li class="nav-item px-1">
                        <a class="nav-link" href="https://portalunimar.unimar.edu.ve/postgraduate-department">Postgrado</a>
                    </li>
                    <!-- Research -->
                    <li class="nav-item px-1">
                        <a class="nav-link" href="https://portalunimar.unimar.edu.ve/research-dir">Investigación</a>
                    </li>
                    <!-- Services -->
                    <li class="nav-item px-1">
                        <a class="nav-link" href="https://portalunimar.unimar.edu.ve/services">Servicios</a>
                    </li>
                    <li class="nav-item px-1">
                        <a class="nav-link" href="./MMU.php">Multimedia Unimar</a>
                    </li>
                </div>
            </div>
        </nav>
    </div>
    <!-- /.navigation-bar -->
</div>
        <!-- /.header -->

        <!-- Content Page -->
        <main class="py-main">
                <div class="content">
                    <!-- Main Banner -->
                    <div class="banner-main">
                        <img src="./Recursos/BANNER MMU.PNG">
                    </div>
                    <!-- /.main-nanner -->

                    <!-- Section Info (Novedades) -->
                    <div class="section-content">
                        <div class="d-flex justify-content-start align-items-center">
                            <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-02.png" alt="Actos de Grado">
                            <h4>Novedades <a class="card-link card-link-whatch-more" href="./Contenido.php">Ver más</a></h4>
                        </div>
                        <div class="row justify-content-center border-0 m-2">
                            <?php foreach ($novedades as $novedad): ?>
                                <div class="col-sm-3 col-dm-3 my-2">
                                    <div class="card h-100 rounded-4 overflow-hidden"> 
                                        <div class="card-body p-0 position-relative">
                                            <img src="<?php echo htmlspecialchars($novedad['imagen']); ?>" class="img-fluid border-secondary rounded-4 img-cover h-100" alt="Miniatura acto de grado">

                                            <div class="hover-text w-100 h-100 position-absolute top-0 start-0 d-flex justify-content-center align-items-center text-white text-center p-3">
                                                <div class="text-justify text-white">
                                                    <p class="mb-0"><?php echo htmlspecialchars($novedad['descripcion']); ?></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <!-- /.section-info -->

                    


                    <!-- Section Actos de GradoInfo -->
                    <div class="section-content">
                        <div class="d-flex justify-content-start align-items-center">
                            <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-02.png" alt="Actos de Grado">
                            <h4>Actos de Grado <a class="card-link card-link-whatch-more" href="./Contenido.php">Ver más</a></h4>
                        </div>
                        <div class="row justify-content-center border-0 m-2">
                            <?php foreach ($ultimosActos as $acto): ?>
                                <div class="col-sm-3 col-dm-3 my-2">
                                    <div class="card h-100 rounded-4 overflow-hidden"> 
                                        <div class="card-body p-0 position-relative">
                                            <img src="<?php echo htmlspecialchars($acto['imagen']); ?>" class="img-fluid border-secondary rounded-4 img-cover h-100" alt="Miniatura acto de grado">

                                            <div class="hover-text w-100 h-100 position-absolute top-0 start-0 d-flex justify-content-center align-items-center text-white text-center p-3">
                                                <div class="text-justify text-white">
                                                    <p class="mb-0"><?php echo htmlspecialchars($acto['descripcion']); ?></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <!-- /.Section Actos de GradoInfo -->


                    <!-- Section Eventos Unimar -->
                
                    <div class="section-content">
                        <div class="d-flex justify-content-start align-items-center">
                            <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-02.png" alt="Actos de Grado">
                            <h4>Eventos <a class="card-link card-link-whatch-more" href="./Contenido.php">Ver más</a></h4>
                        </div>
                        <div class="row justify-content-center border-0 m-2">
                            <?php foreach ($ultimosEventos as $evento): ?>
                                <div class="col-sm-3 col-dm-3 my-2">
                                    <div class="card h-100 rounded-4 overflow-hidden"> 
                                        <div class="card-body p-0 position-relative">
                                            <img src="<?php echo htmlspecialchars($evento['imagen']); ?>" class="img-fluid border-secondary rounded-4 img-cover h-100" alt="Miniatura acto de grado">

                                            <div class="hover-text w-100 h-100 position-absolute top-0 start-0 d-flex justify-content-center align-items-center text-white text-center p-3">
                                                <div class="text-justify text-white">
                                                    <p class="mb-0"><?php echo htmlspecialchars($evento['descripcion']); ?></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <!-- /.Section Eventos Unimar -->


        


                </div>
        </main>
        <!-- /.content-page -->

        <!-- Footer -->
        <!-- Desktop Footer -->
<div class="footer col-sm-12" id="footerdesktop">
    <div class="footer-item">
        <!-- University Logo -->
        <div class="info-university">
            <img src="https://portalunimar.unimar.edu.ve/./image/logo-unimar-22.png">
            <span>Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</span>
        </div>
        <!-- Our Institution -->
        <div class="our-institution">
            <div>
                <ul>
                    <li class="footer-item">
                        <a class="footer-title font-weight-bold" href="https://portalunimar.unimar.edu.ve/our-institution">
                            Nuestra Institución
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/rectorate">Rectorado</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/vicerectorates">Vicerrectorados</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/deaneries">Decanatos</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/student-welfare">Bienestar Estudiantil</a>
                    </li>
                </ul>
            </div>
        </div>
        <!-- Study Offers -->
        <div class="offers">
            <div>
                <ul>
                    <li class="footer-item">
                        <a class="footer-title font-weight-bold" href="https://portalunimar.unimar.edu.ve/study-offers">
                            Ofertas de Estudios
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/undergraduate">
                            Pregrado
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/postgraduate-department">
                            Postgrado
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/extension-diploma/offers">
                            Diplomados
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/extension-course/offers">
                            Cursos y Talleres
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <!-- Web Services -->
        <div class="webs-service">
            <div>
                <ul>
                    <li class="footer-item">
                        <a class="footer-title font-weight-bold" href="https://portalunimar.unimar.edu.ve/services">
                            Servicios Web
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title " href="https://portalunimar.unimar.edu.ve/services">
                            Académicos
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title " href="https://portalunimar.unimar.edu.ve/library">
                            Biblioteca UNIMAR
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title " href="https://www.unimarcientifica.edu.ve/amu/">
                            Educación Virtual
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/service/onlinepayment/inicio" target="_blank">
                            Pagos Online
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <!-- Quick Access -->
        <div class="quickly-access">
            <div>
                <ul>
                    <li class="footer-item">
                        <a class="footer-title font-weight-bold" href="#">Accesos Rápidos</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/contact-us">Directorio Académico</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/academic-calendar">
                            Calendario Académico
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" style="color: #ffffff !important">Contáctanos a través de</a>
                    </li>
                    <li class="footer-item">
                        <ul class="d-flex justify-content-center list-unstyled">
                            <li class="nav-item px-1">
                                <a href="mailto:info@unimar.edu.ve">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/email.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.facebook.com/share/1CJrXgVUPe/">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/facebook.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.twitter.com/somosunimar">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/gorjeo.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.instagram.com/universidademargarita">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/instagram.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/youtube-03.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.linkedin.com/company/univdemargarita">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/linkedin.png">
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <!-- Copyright -->
    <div class="copyright-content">
        <span>© Copyright 2001-2025 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela.</span>
    </div>
</div>
<!-- /.desktop-footer -->

<!-- Mobile Footer -->
<div class="accordion" id="accordionmobile">
        <!-- Social Media -->
        <div class="content-fluid bg-white" style="background-color: #FFFFFF; border: none;">
            <div class="card-header">
                <div class="rrss">
                    <ul class="d-flex justify-content-around list-unstyled">
                        <li class="nav-item">
                            <a href="mailto:info@unimar.edu.ve">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/email.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.facebook.com/share/1CJrXgVUPe/">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/facebook.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.twitter.com/somosunimar">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/gorjeo.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.instagram.com/universidademargarita">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/instagram.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/./image/rrss/youtube-03.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.linkedin.com/company/univdemargarita">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/linkedin.png">
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Our Institution -->
        <div class="content-fluid">
            <div class="card-header" id="headingOne">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-white text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                        Nuestra Institución
                        <span class="fa-sm-x2" style="float: right;">
                            <i class="fas fa-angle-right"></i>
                        </span>
                    </button>
                </h2>
            </div>
            <div id="collapseOne" class="collapse text-white" aria-labelledby="headingOne" data-parent="#accordionmobile">
                <div class="content">
                    <ul>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/rectorate">Rectorado</a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/vicerectorates">Vicerrectorados</a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/deaneries">Decanatos</a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/student-welfare">Bienestar Estudiantil</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Study Offers -->
        <div class="content-fluid">
            <div class="card-header" id="headingTwo">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-white text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        Ofertas de Estudios
                        <span class="fa-sm-x2" style="float: right;">
                            <i class="fas fa-angle-right"></i>
                        </span>
                    </button>
                </h2>
            </div>
            <div id="collapseTwo" class="collapse text-white" aria-labelledby="headingTwo" data-parent="#accordionmobile">
                <div class="content">
                    <ul>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/undergraduate">
                                Pregrado
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/postgraduate-department">
                                Postgrado
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/extension-diploma/offers">
                                Diplomados
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/extension-course/offers">
                                Cursos y Talleres
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Web Services -->
        <div class="content-fluid">
            <div class="card-header" id="headingThree">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-white text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                        Servicios Web
                        <span class="fa-sm-x2" style="float: right;">
                            <i class="fas fa-angle-right"></i>
                        </span>
                    </button>
                </h2>
            </div>
            <div id="collapseThree" class="collapse text-white" aria-labelledby="headingThree" data-parent="#accordionmobile">
                <div class="content">
                    <ul>
                        <li class="footer-item">
                            <a class="footer-title " href="https://portalunimar.unimar.edu.ve/services">
                                Académicos
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title " href="https://portalunimar.unimar.edu.ve/library">
                                Biblioteca UNIMAR
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title " href="https://www.unimarcientifica.edu.ve/amu/">
                                Educación Virtual
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://twitter.com/uniradio_unimar?s=20" target="_blank">
                                Uniradio
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/service/onlinepayment/inicio" target="_blank">
                                Pagos Online
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Quick Access -->
        <div class="content-fluid">
            <div class="card-header" id="headingFour">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-white text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                        Accesos Rápidos
                        <span class="fa-sm-x2" style="float: right;">
                            <i class="fas fa-angle-right"></i>
                        </span>
                    </button>
                </h2>
            </div>
            <div id="collapseFour" class="collapse text-white" aria-labelledby="headingFour" data-parent="#accordionmobile">
                <div class="content">
                    <ul>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/contact-us">Directorio Académico</a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/academic-calendar">
                                Calendario Académico
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- University Logo -->
        <div class="content-fluid">
            <div class="card-header infou">
                <img src="https://portalunimar.unimar.edu.ve/./image/logo-unimar-22.png">
                <span>Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</span>
            </div>
        </div>
        <!-- Copyright -->
        <div class="content-fluid">
            <div class="card-header text-center">
                <span>© Copyright 2001-2025 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela.</span>
            </div>
    </div>
</div>
<!-- /.mobile-footer -->

        <!-- /.footer -->

        <!-- Page Scripts -->
            
</body>
</html>