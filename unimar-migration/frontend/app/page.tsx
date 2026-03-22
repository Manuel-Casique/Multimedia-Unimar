import React from 'react';
import Script from 'next/script';

async function getPublications() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL || 'http://backend:8000/api'}/publications`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).slice(0, 3); // Solo guardamos las últimas 3 para encajar con el diseño
  } catch (err) {
    console.error('Error fetching publications:', err);
    return [];
  }
}

export default async function Home() {
  const publications = await getPublications();

  // Fecha actual para el banner del dólar
  const today = new Date().toLocaleDateString('es-VE');

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/app.css" />
      <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/stylecss.css" />
      <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/fix.css" />
      <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/header.css" />
      <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/footer.css" />
      <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/home.css" />
      <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/unimar-radio/home_absolute_btn.css" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.5.0/mdb.min.css" rel="stylesheet" />

      {/* Targeted CSS overrides to fix Tailwind Preflight conflicts with Bootstrap */}
      <style>{`
        #unimar-home-wrapper img {
          display: inline;
        }
        /* Fix Tailwind .collapse visibility override */
        #unimar-home-wrapper .collapse {
          visibility: inherit !important;
        }
        /* Restrict oversized logo */
        #unimar-home-wrapper .navbar-brand img {
          width: auto !important;
          max-width: 280px !important;
        }
        #unimar-home-wrapper .ml-auto {
          margin-left: auto !important;
        }
        #unimar-home-wrapper .float-right {
          float: right !important;
        }
        #unimar-home-wrapper .text-right {
          text-align: right !important;
        }
        @media (min-width: 768px) {
          #unimar-home-wrapper .navbar-nav {
            flex-direction: row;
          }
          #unimar-home-wrapper .navbar-nav .nav-item {
            padding-right: 0.8rem;
            padding-left: 0.8rem;
          }
        }
      `}</style>

      <div id="unimar-home-wrapper">
        {/* Header */}
        <div className="top-bar">
        {/* Dollar Price */}
        <marquee style={{ backgroundColor: '#d0e0fc', color: '#0b3d91' }}>
          <i className="fa fa-info-circle" aria-hidden="true"></i>
          {' '}El valor del dólar, según el BCV, para el día de hoy <span>{today} es </span><strong id="dollar-bcv-price">--</strong>&nbsp;Bs
        </marquee>

        {/* Social Media and Others */}
        <div className="container-fluid mt-2">
          <div className="row">
            <div className="col-sm-8 col-12 header-media">
              <div className="float-right header-media-float">
                <a className="text-reset text-decoration-none" href="mailto:info@unimar.edu.ve">
                  <img className="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/email.png" alt="Email" />
                </a>
                <a className="text-reset text-decoration-none" href="https://www.facebook.com/share/1CJrXgVUPe/">
                  <img className="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/facebook.png" alt="Facebook" />
                </a>
                <a className="text-reset text-decoration-none" href="https://www.instagram.com/universidademargarita">
                  <img className="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/instagram.png" alt="Instagram" />
                </a>
                <a className="text-reset text-decoration-none" href="https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw">
                  <img className="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/youtube-03.png" alt="YouTube" />
                </a>
                <a className="text-reset text-decoration-none" href="https://www.twitter.com/somosunimar">
                  <img className="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/gorjeo.png" alt="Twitter" />
                </a>
                <a className="text-reset text-decoration-none" href="https://www.linkedin.com/company/univdemargarita">
                  <img className="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/linkedin.png" alt="LinkedIn" />
                </a>
                <a href="https://portalunimar.unimar.edu.ve/service/onlinepayment/inicio" target="_self" title="pagos-online">
                  <img src="https://portalunimar.unimar.edu.ve/./image/online-payments-vertical.png" style={{ height: '26.5px' }} alt="Pagos Online" />
                </a>
              </div>
            </div>
            <div className="col-sm-4 col-12 header-user">
              <div className="text-right text-truncate mx-2 header-user-button">
                <a href="/login" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Inicia Sesión" target="_self" style={{ textDecoration: 'none' }}>
                  <img src="https://portalunimar.unimar.edu.ve/./image/login-vertical.png" style={{ height: '26.5px' }} alt="Login" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="container-fluid">
          <nav className="navbar navbar-expand-md navbar-light bg-white">
            <a className="navbar-brand text-dark" href="/">
              <img className="logo horizontal-logo" src="https://portalunimar.unimar.edu.ve/image/logo-format-horizontal-1.png" alt="UNIMAR logo" width="100%" />
            </a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#demo-navbar" aria-controls="demo-navbar" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="demo-navbar">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item px-1 active">
                  <a className="nav-link text-dark" href="/">Inicio <span className="sr-only">(current)</span></a>
                </li>
                <li className="nav-item px-1 dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Nuestra Institución
                  </a>
                </li>
                <li className="nav-item px-1 dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Estudia en UNIMAR
                  </a>
                </li>
                <li className="nav-item px-1">
                  <a className="nav-link" href="https://portalunimar.unimar.edu.ve/postgraduate-department">Postgrado</a>
                </li>
                <li className="nav-item px-1">
                  <a className="nav-link" href="https://portalunimar.unimar.edu.ve/research-dir">Investigación</a>
                </li>
                <li className="nav-item px-1">
                  <a className="nav-link" href="https://portalunimar.unimar.edu.ve/services">Servicios</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content Page */}
      <main className="py-main">
        <div className="content">
          {/* Main Carousel */}
          <div id="home-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
            <div className="radio-absolute-btn">
              <a href="https://portalunimar.unimar.edu.ve/unimar-radio">
                <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/radio-absolute-banner.png" alt="Radio Unimar" />
              </a>
            </div>
            <div className="carousel-inner">
              <div className="carousel-item active">
                <a href="https://portalunimar.unimar.edu.ve/luisa-virtual-assistant">
                  <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/luisa_bot_banner.png" className="d-block w-100" alt="Banner 1" />
                </a>
              </div>
              <div className="carousel-item">
                <a href="https://portalunimar.unimar.edu.ve/new-students/introductory-course">
                  <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/introductory_course_2026.jpg" className="d-block w-100" alt="Banner 2" />
                </a>
              </div>
              <div className="carousel-item">
                <a href="https://portalunimar.unimar.edu.ve/26-years-anniversary-message">
                  <img src="https://portalunimar.unimar.edu.ve/image/views/es/temporal/26_anniversary_message.png" className="d-block w-100" alt="Banner 3" />
                </a>
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#home-carousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#home-carousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>

          {/* News and Boards Headers */}
          <div className="row">
            <div className="col-md-9">
              <div className="section-content">
                <div className="d-flex justify-content-start align-items-center">
                  <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-02.png" alt="News Icon" />
                  <h4 style={{ margin: 0, marginLeft: '10px' }}>Noticias <a className="card-link card-link-whatch-more" href="/news-unimar" style={{ fontSize: '0.9rem' }}>Ver mas</a></h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 d-none d-md-block event-title-adjust-md">
              <div className="section-content">
                <div className="d-flex justify-content-start align-items-center">
                  <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-03.png" width="100%" alt="Board Icon" />
                  <h4 style={{ margin: 0, marginLeft: '10px' }}>Cartelera <a className="card-link card-link-whatch-more" href="/board-unimar" style={{ fontSize: '0.9rem' }}>Ver mas</a></h4>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic News Generation + Static Board */}
          <div className="row mx-4">

            {/* Contenedor Noticias (Izquierda) */}
            <div className="col-md-9">
              <div className="row">
                {publications.length > 0 ? publications.map((pub: any) => (
                  <div className="col-sm-6 col-md-4 my-2" key={pub.id}>
                    <div className="card bg-greey border-0 responsive h-100 shadow-sm transition-transform hover:scale-[1.02]">
                      <img
                        src={pub.thumbnail_url || (pub.media_assets && pub.media_assets.length > 0 ? pub.media_assets[0].url : 'https://portalunimar.unimar.edu.ve/image/newsimg/thumb_1772828834.jpg')}
                        alt="image-news"
                        style={{ borderRadius: '15px 15px 0 0', width: '100%', height: '240px', objectFit: 'cover' }}
                      />
                      <div className="card-body d-flex flex-column">
                        <a className="card-link" href={`/publications/view/${pub.slug}`}>
                          <h6 className="card-title font-weight-bold">{pub.title}</h6>
                        </a>
                        <div className="card-content mt-auto" style={{ fontSize: '0.8rem' }}>
                          <div className="text-justify m-0">
                            <p className="text-muted">{pub.description ? pub.description.substring(0, 150) + '...' : ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-12 my-2">
                    <p className="text-muted text-center py-5">No hay publicaciones recientes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Static Cartelera (Derecha) */}
            <div className="col-md-3">
              <div className="row">
                <div className="col-12 my-2" style={{ padding: 0 }}>
                  <div className="row no-gutters bg-greey h-100 rounded overflow-hidden">
                    <div className="col-4 text-white content-date d-flex align-items-center justify-content-center" style={{ backgroundColor: '#30669a' }}>
                      <img src="https://portalunimar.unimar.edu.ve/image/board/transparent/2.png" style={{ width: '80%', padding: '10px' }} alt="Date 1" />
                    </div>
                    <div className="col-8">
                      <div className="card-body p-2">
                        <h5 className="card-title font-weight-bold text-left mb-1">
                          <a className="card-link" href="/board-unimar/308" style={{ fontSize: '0.85rem' }}>Intercambio Deportivo Unimar- Tecnológico Antonio José de Sucre</a>
                        </h5>
                        <div className="card-text text-justify" style={{ fontSize: '0.7rem' }}>
                          <p className="mb-0">Te invitamos a que nos acompañes en el Intercambio Deportivo de Fútbol Sala UNIMAR vs. TENOLÓGICO...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 my-2" style={{ padding: 0 }}>
                  <div className="row no-gutters bg-greey h-100 rounded overflow-hidden">
                    <div className="col-4 text-white content-date d-flex align-items-center justify-content-center" style={{ backgroundColor: '#30669a' }}>
                      <img src="https://portalunimar.unimar.edu.ve/image/board/transparent/6.png" style={{ width: '80%', padding: '10px' }} alt="Date 2" />
                    </div>
                    <div className="col-8">
                      <div className="card-body p-2">
                        <h5 className="card-title font-weight-bold text-left mb-1">
                          <a className="card-link" href="/board-unimar/307" style={{ fontSize: '0.85rem' }}>Cronograma de Actividades de la XLIII Promoción.</a>
                        </h5>
                        <div className="card-text text-justify" style={{ fontSize: '0.7rem' }}>
                          <p className="mb-0">Publicado el cronograma de actividades especiales de la XLIII Promoción "Profa. María Eugenia Morales Gómez".</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End Cartelera */}
          </div>

          <br />

          {/* Academic Areas */}
          <div className="section-content">
            <div className="d-flex justify-content-start align-items-center">
              <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-04.png" width="100%" alt="Academic Areas" />
              <h4 style={{ margin: 0, marginLeft: '10px' }}>Áreas Académicas</h4>
            </div>
          </div>
          <div className="content mx-4">
            <div className="row justify-content-center border-0 m-2">
              <div className="col-sm-3 col-dm-3 my-2">
                <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/humarte.png" alt="Humanidades, Artes y Educación" width="100%" />
              </div>
              <div className="col-sm-3 col-dm-3 my-2">
                <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/cjyp.png" alt="Ciencias Jurídicas y Políticas" width="100%" />
              </div>
              <div className="col-sm-3 col-dm-3 my-2">
                <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/ceys.png" alt="Ciencias Económicas y Sociales" width="100%" />
              </div>
              <div className="col-sm-3 col-dm-3 my-2">
                <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/ing.png" alt="Ingeniería y Afines" width="100%" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-desktop mt-5" style={{ backgroundColor: '#0b3d91', color: '#ffffff', padding: '40px 0 20px 0', fontSize: '0.85rem' }}>
        <div className="container-fluid px-md-5">
          <div className="row">
            {/* Logo and Address */}
            <div className="col-lg-3 col-md-12 mb-4 text-center text-lg-start">
              <img src="https://portalunimar.unimar.edu.ve/./image/logo-unimar-22.png" alt="UNIMAR" style={{ maxWidth: '180px', marginBottom: '15px' }} />
              <p className="mb-0" style={{ lineHeight: '1.5' }}>Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</p>
            </div>

            {/* Nuestra Institución */}
            <div className="col-lg-2 col-md-6 mb-4">
              <h6 className="font-weight-bold mb-3" style={{ fontSize: '0.95rem' }}>Nuestra Institución</h6>
              <ul className="list-unstyled" style={{ lineHeight: '2.5' }}>
                <li><a href="#" className="text-white text-decoration-none">Rectorado</a></li>
                <li><a href="#" className="text-white text-decoration-none">Vicerrectorados</a></li>
                <li><a href="#" className="text-white text-decoration-none">Decanatos</a></li>
                <li><a href="#" className="text-white text-decoration-none">Bienestar Estudiantil</a></li>
              </ul>
            </div>

            {/* Oferta de Estudios */}
            <div className="col-lg-2 col-md-6 mb-4">
              <h6 className="font-weight-bold mb-3" style={{ fontSize: '0.95rem' }}>Oferta de Estudios</h6>
              <ul className="list-unstyled" style={{ lineHeight: '2.5' }}>
                <li><a href="#" className="text-white text-decoration-none">Pregrado</a></li>
                <li><a href="#" className="text-white text-decoration-none">Postgrado</a></li>
                <li><a href="#" className="text-white text-decoration-none">Diplomados</a></li>
                <li><a href="#" className="text-white text-decoration-none">Cursos y Talleres</a></li>
              </ul>
            </div>

            {/* Servicios Web */}
            <div className="col-lg-2 col-md-6 mb-4">
              <h6 className="font-weight-bold mb-3" style={{ fontSize: '0.95rem' }}>Servicios Web</h6>
              <ul className="list-unstyled" style={{ lineHeight: '2.5' }}>
                <li><a href="#" className="text-white text-decoration-none">Académicos</a></li>
                <li><a href="#" className="text-white text-decoration-none">Biblioteca UNIMAR</a></li>
                <li><a href="#" className="text-white text-decoration-none">Educación Virtual</a></li>
                <li><a href="#" className="text-white text-decoration-none">Pagos Online</a></li>
              </ul>
            </div>

            {/* Accesos Rápidos */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h6 className="font-weight-bold mb-3" style={{ fontSize: '0.95rem' }}>Accesos Rápidos</h6>
              <ul className="list-unstyled" style={{ lineHeight: '2.5' }}>
                <li><a href="#" className="text-white text-decoration-none">Directorio Académico</a></li>
                <li><a href="#" className="text-white text-decoration-none">Calendario Académico</a></li>
                <li className="mb-2"><span className="text-white">Contáctanos a través de</span></li>
                <li className="d-flex gap-3 mt-2">
                  <a href="mailto:info@unimar.edu.ve" className="text-white"><i className="far fa-envelope"></i></a>
                  <a href="#" className="text-white"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="text-white"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="text-white"><i className="fab fa-instagram"></i></a>
                  <a href="#" className="text-white"><i className="fab fa-youtube"></i></a>
                  <a href="#" className="text-white"><i className="fab fa-linkedin-in"></i></a>
                </li>
              </ul>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12 text-center text-white" style={{ fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <span>© Copyright 2001-2026 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela.</span>
            </div>
          </div>
        </div>
      </footer>

      </div>

      <Script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js" strategy="lazyOnload" />
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" strategy="lazyOnload" />
    </>
  );
}
