<?php
require './FPHP/conex.php';

$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = 3;
$offset = ($page - 1) * $perPage;

try {
    // Contar total de publicaciones
    $stmtTotal = $pdo->query('SELECT COUNT(*) FROM mmu.publicaciones');
    $totalPublicaciones = $stmtTotal->fetchColumn();
} catch (PDOException $e) {
    die("Error contando publicaciones: " . $e->getMessage());
}

$totalPages = ceil($totalPublicaciones / $perPage);

try {
    $sql = "SELECT * FROM mmu.vista_publicaciones_completa ORDER BY fecha_publicacion DESC LIMIT :perPage OFFSET :offset";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Error al obtener publicaciones: " . $e->getMessage());
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
    <title>Portalwebunimar</title>
    <link rel="shortcut icon" href="https://portalunimar.unimar.edu.ve/image/unimar.ico">
    <meta name="csrf-token" content="0ZumWRdOe42UsZ3M7O3AC5NY6BKCWxRVlIfR5dDs">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200&display=swap" rel="stylesheet">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/app.css">
    <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/stylecss.css">
    <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/fix.css">
    <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/header.css">
    <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/footer.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.5.0/mdb.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13" crossorigin="anonymous"></script>
 
    <link rel="stylesheet" href="Contenido.css">
    <script src="https://portalunimar.unimar.edu.ve/js/app.js" defer=""></script>
    <script src="https://portalunimar.unimar.edu.ve/js/portalunimar/header.js" defer=""></script>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js" integrity="sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB" crossorigin="anonymous"></script>
</head>
<body> 
    <div class="top-bar">
        <marquee style="background-color: #d0e0fc; color:#0b3d91;">
            <i class="fa fa-info-circle" aria-hidden="true"></i>
            El valor del dólar, según el BCV, para el día de hoy <span>07-06-2025 es </span><strong id="dollar-bcv-price">99.09</strong> Bs
        </marquee>
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
        <div class="container-fluid">
            <nav class="navbar navbar-expand-md navbar-light bg-white">
                <a class="navbar-brand text-dark" href="./index.php"><img class="logo horizontal-logo" id="anniversary" src="https://portalunimar.unimar.edu.ve/image/logounimar-25-aniversario.png" alt="UNIMAR logo" width="100%"></a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#demo-navbar" aria-controls="demo-navbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="demo-navbar">
                    <div class="navbar-nav ml-auto">
                        <li class="nav-item px-1 active">
                            <a class="nav-link text-dark" href="./index.php">Inicio
                                <span class="sr-only">(current)</span>
                            </a>
                        </li>
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
                                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/cjyp-deanery">Ciencias Jurídicas y Políticas</a></li>
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
                        <li class="nav-item px-1">
                            <a class="nav-link" href="https://portalunimar.unimar.edu.ve/postgraduate-department">Postgrado</a>
                        </li>
                        <li class="nav-item px-1">
                            <a class="nav-link" href="https://portalunimar.unimar.edu.ve/research-dir">Investigación</a>
                        </li>
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
        </div>
    <main class="py-main">
        <div class="content">
            <div class="banner-main">
                <img src="./Recursos/BANNER MMU.PNG">
            </div>
            <div class="container-fluid mt-3">
                <div class="row">
                    <div class="col-md-3 col-lg-2">
                        <div class="sidebar-container">
                            <div class="filter-header">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-funnel-fill" viewBox="0 0 16 16">
                                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.146.336L10.5 8.54V14.5a.5.5 0 0 1-.293.455l-3.5 2A.5.5 0 0 1 6 14.5V8.54L1.646 3.836A.5.5 0 0 1 1.5 3.5z"/>
                                </svg>
                                FILTROS
                            </div>
                            <div class="list-group sidebar-list-group">
                                <a class="list-group-item list-group-item-action filter-item-collapse-trigger" data-bs-toggle="collapse" href="#yearsCollapse" role="button" aria-expanded="true" aria-controls="yearsCollapse">
                                    AÑO
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                    </svg>
                                </a>
                                <div class="collapse" id="yearsCollapse">
                                    <a href="javascript:void(0)" class="list-group-item list-group-item-action collapse-sub-item" data-filter-group="year" data-filter-value="2025">2025</a>
                                    <a href="javascript:void(0)" class="list-group-item list-group-item-action collapse-sub-item" data-filter-group="year" data-filter-value="2024">2024</a>
                                    <a href="javascript:void(0)" class="list-group-item list-group-item-action collapse-sub-item" data-filter-group="year" data-filter-value="2023">2023</a>
                                    <a href="javascript:void(0)" class="list-group-item list-group-item-action collapse-sub-item" data-filter-group="year" data-filter-value="2022">2022</a>
                                    <a href="javascript:void(0)" class="list-group-item list-group-item-action collapse-sub-item" data-filter-group="year" data-filter-value="2021">2021</a>
                                </div>
                                <a href="javascript:void(0)" class="list-group-item list-group-item-action filter-item" data-filter-group="category" data-filter-value="ACTOS DE GRADO">ACTOS DE GRADO</a>
                                <a href="javascript:void(0)" class="list-group-item list-group-item-action filter-item" data-filter-group="category" data-filter-value="CURSOS EXTRACURRICULARES">CURSOS EXTRACURRICULARES</a>
                                <a href="javascript:void(0)" class="list-group-item list-group-item-action filter-item" data-filter-group="category" data-filter-value="Evento">EVENTOS</a>
                                <a href="javascript:void(0)" class="list-group-item list-group-item-action filter-item" data-filter-group="category" data-filter-value="Artículo">ARTÍCULOS</a>
                                <a href="javascript:void(0)" class="list-group-item list-group-item-action filter-item" data-filter-group="category" data-filter-value="Noticia">NOTICIAS</a>
                            </div>
                        </div>
                    </div>



                            <div class="col-md-9 col-lg-10">
                                <div class="container-fluid p-1 mb-4">
                                <div class="input-group mx-auto">
                                    <input type="text" id="searchInput" class="form-control rounded-start" placeholder="Buscar..." aria-label="Buscar" style="height: 48px;">
                                    <button id="searchBtn" class="btn btn-primary rounded-end d-flex align-items-center justify-content-center" type="button" style="height: 48px; width: 48px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-search" viewBox="0 0 16 16">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.085.12l3.493 3.493a1 1 0 0 0 1.414-1.414l-3.493-3.493a1 1 0 0 0-.12-.085zM6.5 11A4.5 4.5 0 1 1 6.5 2a4.5 4.5 0 0 1 0 9"/>
                                    </svg>
                                    </button>
                                </div>
                                </div>

                                <div id="contenedor-publicaciones">
                                <!-- Aquí se cargarán las tarjetas con JavaScript y AJAX -->
                                </div>

                            </div>
            </div>
        </div>



    </main>
    <div class="footer col-sm-12" id="footerdesktop">
        <div class="footer-item">
            <div class="info-university">
                <img src="https://portalunimar.unimar.edu.ve/./image/logo-unimar-22.png">
                <span>Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</span>
            </div>
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
                                        <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/./image/rrss/youtube-03.png">
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
        <div class="copyright-content">
            <span>© Copyright 2001-2025 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela.</span>
        </div>
    </div>
    <div class="accordion" id="accordionmobile">
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
        <div class="content-fluid">
            <div class="card-header infou">
                <img src="https://portalunimar.unimar.edu.ve/./image/logo-unimar-22.png">
                <span>Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</span>
            </div>
        </div>
        <div class="content-fluid">
            <div class="card-header text-center">
                <span>© Copyright 2001-2025 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela.</span>
            </div>
        </div>
    </div>
    <script>
        // JavaScript para manejar el estado "activo" de los filtros
        document.addEventListener('DOMContentLoaded', function() {
            const selectableFilterItems = document.querySelectorAll('.filter-item, .collapse-sub-item');
            
            selectableFilterItems.forEach(item => {
                item.addEventListener('click', function(event) {
                    event.preventDefault(); 

                    const filterGroup = this.getAttribute('data-filter-group');

                    
                    document.querySelectorAll(`[data-filter-group="${filterGroup}"]`).forEach(el => {
                        el.classList.remove('active');
                    });

                    
                    this.classList.add('active');

                   
                    console.log('Filtro clickeado:', this.textContent.trim(), 'Grupo:', filterGroup);
                });
            });
        });
    </script>
    <script src="filtro.js"></script>

</body>
</html>