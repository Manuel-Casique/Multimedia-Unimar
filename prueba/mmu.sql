-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 02-12-2025 a las 00:23:09
-- Versión del servidor: 8.4.3
-- Versión de PHP: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mmu`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `crear_publicacion_completa` (IN `p_titulo` VARCHAR(150), IN `p_descripcion` TEXT, IN `p_miniatura_id` INT, IN `p_usuario_id` INT, IN `p_tipos_ids` VARCHAR(255))   BEGIN
    DECLARE v_publicacion_id INT;
    DECLARE v_tipo_id VARCHAR(10);
    DECLARE v_pos INT;

    START TRANSACTION;

    -- 1️⃣ Crear la publicación
    INSERT INTO publicaciones (titulo, descripcion, fecha_publicacion, fecha_actualizacion) 
    VALUES (p_titulo, p_descripcion, NOW(), NULL);
    SET v_publicacion_id = LAST_INSERT_ID();

    -- 2️⃣ Asignar la miniatura (usando id de contenido correspondiente)
    IF p_miniatura_id IS NOT NULL THEN
        INSERT INTO publicacion_contenido (publicacion_id, contenido_id) 
        VALUES (v_publicacion_id, p_miniatura_id);
    END IF;

    -- 3️⃣ Asignar autor de la publicación
    IF p_usuario_id IS NOT NULL THEN
        INSERT INTO publicacion_autor (publicacion_id, usuario_id) 
        VALUES (v_publicacion_id, p_usuario_id);
    END IF;

    -- 4️⃣ Asignar Tipos de Publicación
    IF p_tipos_ids IS NOT NULL AND p_tipos_ids <> '' THEN
        WHILE LENGTH(p_tipos_ids) > 0 DO
            SET v_pos = LOCATE(',', p_tipos_ids);
            
            IF v_pos > 0 THEN
                SET v_tipo_id = SUBSTRING(p_tipos_ids, 1, v_pos - 1);
                SET p_tipos_ids = SUBSTRING(p_tipos_ids, v_pos + 1);
            ELSE
                SET v_tipo_id = p_tipos_ids;
                SET p_tipos_ids = '';
            END IF;

            INSERT INTO publicacion_tipo (publicacion_id, tipo_id) VALUES (v_publicacion_id, v_tipo_id);
        END WHILE;
    END IF;

    COMMIT;

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contenido`
--

CREATE TABLE `contenido` (
  `id` int NOT NULL,
  `tipo_id` int NOT NULL,
  `url` varchar(500) NOT NULL,
  `descripcion` text,
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `contenido`
--

INSERT INTO `contenido` (`id`, `tipo_id`, `url`, `descripcion`, `fecha_subida`) VALUES
(1, 1, 'https://unimar.edu.ve/media/imagen1.jpg', 'Foto del evento principal', '2025-06-10 22:05:43'),
(2, 2, 'https://unimar.edu.ve/media/video1.mp4', 'Video resumen de la conferencia', '2025-06-10 22:05:43'),
(3, 3, 'https://unimar.edu.ve/media/audio1.mp3', 'Audio de la presentación', '2025-06-10 22:05:43'),
(4, 1, 'https://unimar.edu.ve/media/imagen2.jpg', 'Imagen promocional del concurso', '2025-06-10 22:05:43'),
(5, 4, './recursos/FCARD.JPG', 'Miniatura para publicación ID 1', '2025-06-24 21:00:08'),
(6, 4, './recursos/FCARD_1.JPG', 'Miniatura para publicación ID 2', '2025-06-24 21:00:08'),
(7, 4, './recursos/FCARD_2.JPG', 'Miniatura para publicación ID 3', '2025-06-24 21:00:08'),
(12, 4, './recursos/FCARD_4.jpg', 'Miniatura Acto de grado 2024', '2025-06-25 01:06:56'),
(13, 4, './recursos/FCARD_5.jpg', 'Miniatura Curso de Desarrollo Web', '2025-06-25 01:06:56'),
(14, 4, './recursos/FCARD_6.jpg', 'Miniatura Evento de Bienvenida', '2025-06-25 01:06:56'),
(15, 4, './recursos/FCARD_7.jpg', 'Miniatura Artículo de Investigación IA', '2025-06-25 01:06:56'),
(16, 4, './recursos/FCARD_8.jpg', 'Miniatura Noticia Importante UNIMAR', '2025-06-25 01:06:56'),
(17, 4, './recursos/FCARD_9.jpg', 'Miniatura Acto de grado 2023', '2025-06-25 01:06:56'),
(18, 4, './recursos/FCARD_10.jpg', 'Miniatura Curso de Bases de Datos', '2025-06-25 01:06:56'),
(19, 4, './recursos/FCARD_11.jpg', 'Miniatura Evento Deportivo UNIMAR', '2025-06-25 01:06:56'),
(20, 4, './recursos/FCARD_12.jpg', 'Miniatura Artículo de Tecnología', '2025-06-25 01:06:56'),
(21, 4, './recursos/FCARD_13.jpg', 'Miniatura Noticia Cultural UNIMAR', '2025-06-25 01:06:56'),
(22, 4, './recursos/FCARD_14.jpg', 'Miniatura Acto de grado 2022', '2025-06-25 01:06:56'),
(23, 4, './recursos/FCARD_15.jpg', 'Miniatura Curso de Emprendimiento', '2025-06-25 01:06:56'),
(24, 4, './recursos/FCARD_16.jpg', 'Miniatura del Evento de Bienvenida 2023', '2025-06-25 01:57:33'),
(25, 4, './recursos/FCARD_17.jpg', 'Miniatura del Evento Deportivo UNIMAR 2023', '2025-06-25 01:57:33'),
(26, 4, './recursos/FCARD_18.jpg', 'Miniatura del Evento de Cultura y Arte 2024', '2025-06-25 01:57:33'),
(27, 4, './recursos/FCARD_19.jpg', 'Miniatura del Evento de Innovación 2025', '2025-06-25 01:57:33'),
(28, 4, './recursos/FCARD_20.jpg', 'Miniatura del Acto de grado 2025-I', '2025-06-25 01:57:41'),
(29, 4, './recursos/FCARD_21.jpg', 'Miniatura del Acto de grado 2022', '2025-06-25 01:57:41'),
(30, 4, './recursos/FCARD_22.jpg', 'Miniatura del Acto de grado 2021', '2025-06-25 01:57:41'),
(31, 4, './recursos/FCARD_23.jpg', 'Miniatura del Acto de grado 2024-II', '2025-06-25 01:57:41'),
(32, 4, './Recursos/img_685b6e8681d34.gif', 'Miniatura para Prueba de formulario', '2025-06-25 03:35:34'),
(33, 4, './Recursos/img_685b6f6267f5c.gif', 'Miniatura para Torneo de e-sport en la unimar pronto Spoilers', '2025-06-25 03:39:14'),
(34, 4, './Recursos/img_685b70975eb8f.jpeg', 'Miniatura para suculenta power fuera de control', '2025-06-25 03:44:23'),
(37, 4, './Recursos/img_685beaa735c5e.jpg', 'Miniatura para Prueba ', '2025-06-25 12:25:11'),
(38, 4, './Recursos/img_685c44aa9ae09.jpg', 'Miniatura para cesar augusto', '2025-06-25 18:49:14'),
(39, 4, './Recursos/img_686afcbb56b71.png', 'Miniatura para Prueba de formulario 2', '2025-07-06 22:46:19'),
(40, 4, './Recursos/img_686afcd64e9ad.jpg', 'Miniatura para Prueba de formulario 2', '2025-07-06 22:46:46'),
(41, 4, './Recursos/img_686b397eeff24.jpg', 'Miniatura para Prueba de formulario 2', '2025-07-07 03:05:34'),
(42, 4, './Recursos/img_686b39a310384.jpg', 'Miniatura para Prueba de formulario 3', '2025-07-07 03:06:11'),
(43, 4, './Recursos/img_686b39f4d94c1.jpg', 'Miniatura para Prueba de formulario 3', '2025-07-07 03:07:32'),
(44, 4, './Recursos/img_686b3a37185a9.jpg', 'Miniatura para Prueba de formulario 5', '2025-07-07 03:08:39'),
(45, 4, './Recursos/img_686b3b4fb56e1.jpg', 'Miniatura para asdasd', '2025-07-07 03:13:19'),
(46, 4, './Recursos/img_686b407009fd9.jpg', 'Miniatura para asddas', '2025-07-07 03:35:12'),
(47, 4, './Recursos/img_686b5a302e24a.jpg', 'Miniatura para Prueba cesar', '2025-07-07 05:25:04'),
(48, 4, './Recursos/img_686bc88cefce8.jpg', 'Miniatura para Formula 1', '2025-07-07 13:15:56'),
(49, 4, './Recursos/img_686bcb5fa5e4a.png', 'Miniatura para prueba para mama', '2025-07-07 13:27:59'),
(50, 4, './Recursos/img_686f77dce0554.jpg', 'Miniatura para prueba para edición', '2025-07-10 08:20:44'),
(51, 4, './Recursos/img_686f780643531.jpg', 'Miniatura para prueba para edición 2', '2025-07-10 08:21:26'),
(52, 4, './Recursos/img_686f7b32bbb46.jpg', 'Miniatura para asddas', '2025-07-10 08:34:58'),
(53, 4, './Recursos/img_68713c06e2201.png', 'Miniatura para prueba para editar', '2025-07-11 16:29:58'),
(54, 4, './Recursos/img_6871403fc5326.png', 'Miniatura para prueba para editada', '2025-07-11 16:47:59'),
(55, 4, './Recursos/img_68765bde6c438.png', 'Miniatura para prueba para editada christian', '2025-07-15 13:47:10'),
(56, 4, './Recursos/img_687677d4e7640.png', 'Miniatura para prueba para omar', '2025-07-15 15:46:28'),
(57, 4, './Recursos/img_687679d211ec0.png', 'Miniatura para prueba para christohfer', '2025-07-15 15:54:58'),
(58, 4, './Recursos/img_68767bf64a863.jpg', 'Miniatura para prueba gil', '2025-07-15 16:04:06'),
(59, 4, './Recursos/img_68767d5411b98.jpg', 'Miniatura para prueba', '2025-07-15 16:09:56'),
(60, 4, './Recursos/img_68767e9c6964e.png', 'Miniatura para prueba ', '2025-07-15 16:15:24'),
(61, 4, './Recursos/img_6876811088624.png', 'Miniatura para prueba para amador', '2025-07-15 16:25:52'),
(62, 4, './Recursos/img_687683a490b6b.jpg', 'Miniatura para prueba para guillermo', '2025-07-15 16:36:52'),
(63, 4, './Recursos/img_6876859ab0c71.jpg', 'Miniatura para ruben', '2025-07-15 16:45:14'),
(64, 4, './Recursos/img_687686178e528.jpg', 'Miniatura para roli', '2025-07-15 16:47:19'),
(65, 4, './Recursos/img_68768f5483a9e.jpg', 'Miniatura para nour', '2025-07-15 17:26:44'),
(66, 4, './Recursos/img_6876933d975c2.jpg', 'Miniatura para prueba ', '2025-07-15 17:43:25'),
(67, 4, './Recursos/img_687696d412f20.jpg', 'Miniatura para prueba para profe vero', '2025-07-15 17:58:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicaciones`
--

CREATE TABLE `publicaciones` (
  `id` int NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text,
  `fecha_publicacion` datetime NOT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `publicaciones`
--

INSERT INTO `publicaciones` (`id`, `titulo`, `descripcion`, `fecha_publicacion`, `fecha_actualizacion`) VALUES
(2, 'Conferencia sobre Innovación Tecnológica', 'Resumen y detalles de la conferencia. ', '2025-05-15 00:00:00', '2025-10-01 14:45:35'),
(3, 'Convocatoria a concurso cultural', 'Bases y requisitos para participar.', '2025-07-08 00:00:00', '2024-04-21 12:00:00'),
(11, 'Acto de grado 2024', 'Ceremonia oficial de graduación donde se reconocen los esfuerzos y logros académicos de los estudiantes de la Universidad de Margarita en el año 2024, con la entrega de diplomas y discursos de clausura.', '2024-06-15 00:00:00', NULL),
(12, 'Curso de Desarrollo Web', 'Curso intensivo diseñado para estudiantes y profesionales interesados en aprender las tecnologías más actuales para crear sitios web modernos y responsivos, abarcando HTML, CSS, JavaScript y frameworks populares.', '2023-09-10 00:00:00', NULL),
(13, 'Evento de Bienvenida', 'Actividad organizada para dar la bienvenida a los estudiantes de nuevo ingreso, facilitando su integración y familiarización con la comunidad universitaria, además de presentar los servicios y oportunidades académicas.', '2023-08-20 00:00:00', NULL),
(14, 'Artículo de Investigación IA', 'Publicación académica que analiza los avances recientes en inteligencia artificial aplicados al sector educativo, destacando innovaciones, desafíos y perspectivas futuras en el aprendizaje automatizado.', '2023-11-25 00:00:00', NULL),
(15, 'Noticia Importante UNIMAR', 'Anuncio oficial sobre la apertura de nuevas instalaciones deportivas en la Universidad de Margarita, que buscan fomentar la práctica deportiva y mejorar la calidad de vida estudiantil.', '2023-10-05 00:00:00', NULL),
(16, 'Acto de grado 2023', 'Ceremonia de graduación correspondiente a la promoción del año 2023, donde se celebra la culminación de los estudios universitarios de los egresados con discursos y entrega de títulos.', '2023-06-18 00:00:00', NULL),
(17, 'Curso de Bases de Datos', 'Introducción práctica a la administración y diseño de bases de datos relacionales, abordando conceptos de modelado, consultas SQL y optimización para aplicaciones reales.', '2023-04-10 00:00:00', NULL),
(18, 'Evento Deportivo UNIMAR', 'Competencia deportiva interfacultades organizada por la Universidad de Margarita, destinada a promover la actividad física, el compañerismo y la sana competencia entre estudiantes.', '2023-03-12 00:00:00', NULL),
(19, 'Artículo de Tecnología', 'Ensayo detallado sobre las últimas tendencias en inteligencia artificial y su impacto en la sociedad, incluyendo aplicaciones, beneficios y consideraciones éticas.', '2023-07-25 00:00:00', NULL),
(20, 'Noticia Cultural UNIMAR', 'Cobertura de la inauguración de la nueva biblioteca digital de la Universidad de Margarita, que ofrece acceso remoto a una amplia colección de recursos académicos y culturales.', '2023-09-15 00:00:00', NULL),
(21, 'Acto de grado 2022', 'Celebración formal de graduación de los estudiantes que concluyeron sus estudios en el año 2022, con reconocimiento a su esfuerzo y dedicación durante la carrera.', '2022-06-18 00:00:00', NULL),
(22, 'Curso de Emprendimiento', 'Taller dirigido a estudiantes interesados en desarrollar habilidades empresariales, cubriendo temas de planificación, finanzas, marketing y gestión para iniciar su propio negocio.', '2023-11-30 00:00:00', NULL),
(23, 'Evento de Bienvenida 2023', 'Acto para recibir a los estudiantes de nuevo ingreso en la UNIMAR.', '2023-08-20 00:00:00', NULL),
(24, 'Evento Deportivo UNIMAR 2023', 'Encuentro deportivo universitario para estudiantes y profesores.', '2023-03-12 00:00:00', NULL),
(25, 'Evento de Cultura y Arte 2024', 'Exposición de arte y actividades culturales en la UNIMAR.', '2024-07-15 00:00:00', NULL),
(26, 'Evento de Innovación 2025', 'Feria de proyectos tecnológicos e innovadores para estudiantes.', '2025-10-10 00:00:00', NULL),
(27, 'Acto de grado 2025-I', 'Ceremonia de graduación para estudiantes de la UNIMAR, primer acto del 2025.', '2025-06-20 00:00:00', NULL),
(28, 'Acto de grado 2022', 'Ceremonia de graduación para estudiantes de la UNIMAR correspondiente al año 2022.', '2022-06-18 00:00:00', NULL),
(29, 'Acto de grado 2021', 'Ceremonia de graduación para estudiantes de la UNIMAR correspondiente al año 2021.', '2021-06-18 00:00:00', NULL),
(30, 'Acto de grado 2024-II', 'Ceremonia de graduación para estudiantes de la UNIMAR correspondiente al segundo acto de 2024.', '2024-12-15 00:00:00', NULL),
(59, 'ruben', 'prueba para ruben', '2025-07-15 00:00:00', NULL),
(61, 'nour', 'prueba para nour', '2025-07-15 00:00:00', NULL),
(62, 'prueba ', 'prueba para alejandro, criado y fiol', '2025-07-15 00:00:00', NULL),
(63, 'prueba para profe vero', 'veronica', '2025-07-15 00:00:00', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion_autor`
--

CREATE TABLE `publicacion_autor` (
  `id` int NOT NULL,
  `publicacion_id` int NOT NULL,
  `usuario_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `publicacion_autor`
--

INSERT INTO `publicacion_autor` (`id`, `publicacion_id`, `usuario_id`) VALUES
(8, 11, 1),
(9, 15, 1),
(10, 19, 1),
(11, 12, 2),
(12, 16, 2),
(13, 20, 2),
(14, 13, 3),
(15, 17, 3),
(16, 21, 3),
(17, 14, 4),
(18, 18, 4),
(19, 22, 4),
(20, 23, 1),
(21, 23, 3),
(22, 24, 2),
(23, 24, 4),
(24, 25, 3),
(25, 25, 5),
(26, 26, 4),
(27, 26, 7),
(28, 27, 1),
(29, 27, 2),
(30, 28, 1),
(31, 28, 3),
(32, 29, 2),
(33, 29, 4),
(34, 30, 3),
(35, 30, 5),
(56, 3, 2),
(57, 3, 3),
(82, 59, 1),
(89, 61, 1),
(90, 62, 1),
(93, 63, 1),
(94, 2, 1),
(95, 2, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion_contenido`
--

CREATE TABLE `publicacion_contenido` (
  `id` int NOT NULL,
  `publicacion_id` int NOT NULL,
  `contenido_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `publicacion_contenido`
--

INSERT INTO `publicacion_contenido` (`id`, `publicacion_id`, `contenido_id`) VALUES
(2, 2, 6),
(3, 3, 7),
(13, 11, 12),
(14, 12, 13),
(15, 13, 14),
(16, 14, 15),
(17, 15, 16),
(18, 16, 17),
(19, 17, 18),
(20, 18, 19),
(21, 19, 20),
(22, 20, 21),
(23, 21, 22),
(24, 22, 23),
(28, 23, 24),
(29, 24, 25),
(30, 25, 26),
(31, 26, 27),
(32, 27, 28),
(33, 28, 29),
(34, 29, 30),
(35, 30, 31),
(67, 59, 63),
(69, 61, 65),
(70, 62, 66),
(71, 63, 67);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion_tipo`
--

CREATE TABLE `publicacion_tipo` (
  `id` int NOT NULL,
  `publicacion_id` int NOT NULL,
  `tipo_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `publicacion_tipo`
--

INSERT INTO `publicacion_tipo` (`id`, `publicacion_id`, `tipo_id`) VALUES
(3, 3, 3),
(11, 11, 4),
(12, 12, 5),
(13, 13, 2),
(14, 14, 1),
(15, 15, 3),
(16, 16, 4),
(17, 17, 5),
(18, 18, 2),
(19, 19, 1),
(20, 20, 3),
(21, 21, 4),
(22, 22, 5),
(23, 23, 2),
(24, 24, 2),
(25, 25, 2),
(26, 26, 2),
(27, 27, 4),
(28, 28, 4),
(29, 29, 4),
(30, 30, 4),
(78, 59, 1),
(85, 61, 3),
(86, 62, 2),
(87, 62, 3),
(90, 63, 2),
(91, 2, 1),
(92, 2, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_contenido`
--

CREATE TABLE `tipos_contenido` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tipos_contenido`
--

INSERT INTO `tipos_contenido` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Imagen', 'Archivos gráficos en formato JPG, PNG, GIF, etc.'),
(2, 'Video', 'Archivos de video en formatos MP4, AVI, MOV, etc.'),
(3, 'Audio', 'Archivos de sonido en formatos MP3, WAV, etc.'),
(4, 'Miniatura', 'Imagen destacada para publicaciones');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_publicacion`
--

CREATE TABLE `tipos_publicacion` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tipos_publicacion`
--

INSERT INTO `tipos_publicacion` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Artículo', 'Publicación tipo artículo científico o académico'),
(2, 'Evento', 'Publicación relacionada a eventos y actividades'),
(3, 'Noticia', 'Publicación de noticias generales'),
(4, 'Actos de grado', 'Ceremonias de graduación'),
(5, 'Cursos extracurriculares', 'Cursos para estudiantes en áreas específicas');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `ultimos_actos_grado`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `ultimos_actos_grado` (
`id` int
,`titulo` varchar(150)
,`descripcion` text
,`fecha_publicacion` datetime
,`imagen` varchar(500)
,`autores` text
,`tipos` text
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `ultimos_eventos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `ultimos_eventos` (
`id` int
,`titulo` varchar(150)
,`descripcion` text
,`fecha_publicacion` datetime
,`imagen` varchar(500)
,`autores` text
,`tipos` text
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `rol`) VALUES
(1, 'Manuel', 'Casique', 'mcasique@uni.edu.ve', '18032002', 'admin'),
(2, 'Gil', 'Mata', 'gmata@uni.edu.ve', '04032004', 'editor'),
(3, 'Ana', 'Lopez', 'ana.lopez@example.com', 'hashedpassword3', 'usuario'),
(4, 'Luis', 'Martínez', 'luis@example.com', 'hashed_password_4', 'usuario'),
(5, 'Juana', 'Gómez', 'ana@example.com', 'hashed_password_5', 'usuario'),
(6, 'Carlos', 'Rodríguez', 'carlos@example.com', 'hashed_password_6', 'usuario'),
(7, 'María', 'López', 'mlopez@uni.edu.ve', '12345', 'usuario');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_novedades`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_novedades` (
`id` int
,`titulo` varchar(150)
,`descripcion` text
,`fecha_publicacion` datetime
,`imagen` varchar(500)
,`autores` text
,`tipos` text
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_publicaciones_completa`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_publicaciones_completa` (
`id` int
,`titulo` varchar(150)
,`descripcion` text
,`fecha_publicacion` datetime
,`imagen` varchar(500)
,`autores` text
,`tipos` text
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_publicaciones_detalle`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_publicaciones_detalle` (
`id` int
,`titulo` varchar(150)
,`descripcion` text
,`fecha_publicacion` datetime
,`imagen` varchar(500)
,`autores` text
,`tipos` text
);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `contenido`
--
ALTER TABLE `contenido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tipo_id` (`tipo_id`);

--
-- Indices de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `publicacion_autor`
--
ALTER TABLE `publicacion_autor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `fk_publicacion_autor` (`publicacion_id`);

--
-- Indices de la tabla `publicacion_contenido`
--
ALTER TABLE `publicacion_contenido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contenido_id` (`contenido_id`),
  ADD KEY `fk_publicacion_contenido` (`publicacion_id`);

--
-- Indices de la tabla `publicacion_tipo`
--
ALTER TABLE `publicacion_tipo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tipo_id` (`tipo_id`),
  ADD KEY `fk_publicacion_tipo` (`publicacion_id`);

--
-- Indices de la tabla `tipos_contenido`
--
ALTER TABLE `tipos_contenido`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `tipos_publicacion`
--
ALTER TABLE `tipos_publicacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `contenido`
--
ALTER TABLE `contenido`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT de la tabla `publicacion_autor`
--
ALTER TABLE `publicacion_autor`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT de la tabla `publicacion_contenido`
--
ALTER TABLE `publicacion_contenido`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT de la tabla `publicacion_tipo`
--
ALTER TABLE `publicacion_tipo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT de la tabla `tipos_contenido`
--
ALTER TABLE `tipos_contenido`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tipos_publicacion`
--
ALTER TABLE `tipos_publicacion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

-- --------------------------------------------------------

--
-- Estructura para la vista `ultimos_actos_grado`
--
DROP TABLE IF EXISTS `ultimos_actos_grado`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ultimos_actos_grado`  AS SELECT `p`.`id` AS `id`, `p`.`titulo` AS `titulo`, `p`.`descripcion` AS `descripcion`, `p`.`fecha_publicacion` AS `fecha_publicacion`, `cont_min`.`url` AS `imagen`, group_concat(distinct concat(`u`.`nombre`,' ',`u`.`apellido`) separator ', ') AS `autores`, group_concat(distinct `tp`.`nombre` separator ', ') AS `tipos` FROM (((((((`publicaciones` `p` left join `publicacion_contenido` `pcont_min` on((`p`.`id` = `pcont_min`.`publicacion_id`))) left join `contenido` `cont_min` on((`pcont_min`.`contenido_id` = `cont_min`.`id`))) left join `tipos_contenido` `tcont` on(((`cont_min`.`tipo_id` = `tcont`.`id`) and (`tcont`.`nombre` = 'miniatura')))) left join `publicacion_autor` `pa` on((`p`.`id` = `pa`.`publicacion_id`))) left join `usuarios` `u` on((`pa`.`usuario_id` = `u`.`id`))) left join `publicacion_tipo` `pt` on((`p`.`id` = `pt`.`publicacion_id`))) left join `tipos_publicacion` `tp` on((`pt`.`tipo_id` = `tp`.`id`))) WHERE (`pt`.`tipo_id` = 4) GROUP BY `p`.`id`, `p`.`titulo`, `p`.`descripcion`, `p`.`fecha_publicacion`, `cont_min`.`url` ORDER BY `p`.`fecha_publicacion` DESC LIMIT 0, 4 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `ultimos_eventos`
--
DROP TABLE IF EXISTS `ultimos_eventos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ultimos_eventos`  AS SELECT `p`.`id` AS `id`, `p`.`titulo` AS `titulo`, `p`.`descripcion` AS `descripcion`, `p`.`fecha_publicacion` AS `fecha_publicacion`, `cont_min`.`url` AS `imagen`, group_concat(distinct concat(`u`.`nombre`,' ',`u`.`apellido`) separator ', ') AS `autores`, group_concat(distinct `tp`.`nombre` separator ', ') AS `tipos` FROM (((((((`publicaciones` `p` left join `publicacion_contenido` `pcont_min` on((`p`.`id` = `pcont_min`.`publicacion_id`))) left join `contenido` `cont_min` on((`pcont_min`.`contenido_id` = `cont_min`.`id`))) left join `tipos_contenido` `tcont` on(((`cont_min`.`tipo_id` = `tcont`.`id`) and (`tcont`.`nombre` = 'miniatura')))) left join `publicacion_autor` `pa` on((`p`.`id` = `pa`.`publicacion_id`))) left join `usuarios` `u` on((`pa`.`usuario_id` = `u`.`id`))) left join `publicacion_tipo` `pt` on((`p`.`id` = `pt`.`publicacion_id`))) left join `tipos_publicacion` `tp` on((`pt`.`tipo_id` = `tp`.`id`))) WHERE (`pt`.`tipo_id` = 2) GROUP BY `p`.`id`, `p`.`titulo`, `p`.`descripcion`, `p`.`fecha_publicacion`, `cont_min`.`url` ORDER BY `p`.`fecha_publicacion` DESC LIMIT 0, 4 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_novedades`
--
DROP TABLE IF EXISTS `vista_novedades`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_novedades`  AS SELECT `pu`.`id` AS `id`, `pu`.`titulo` AS `titulo`, `pu`.`descripcion` AS `descripcion`, `pu`.`fecha_publicacion` AS `fecha_publicacion`, `cont_min`.`url` AS `imagen`, group_concat(distinct concat(`us`.`nombre`,' ',`us`.`apellido`) separator ', ') AS `autores`, group_concat(distinct `tp`.`nombre` separator ', ') AS `tipos` FROM (((((((`publicaciones` `pu` join `publicacion_contenido` `pcont_min` on((`pu`.`id` = `pcont_min`.`publicacion_id`))) join `contenido` `cont_min` on((`pcont_min`.`contenido_id` = `cont_min`.`id`))) join `tipos_contenido` `tcont` on(((`cont_min`.`tipo_id` = `tcont`.`id`) and (`tcont`.`nombre` = 'miniatura')))) join `publicacion_autor` `pa` on((`pu`.`id` = `pa`.`publicacion_id`))) join `usuarios` `us` on((`pa`.`usuario_id` = `us`.`id`))) join `publicacion_tipo` `pt` on((`pu`.`id` = `pt`.`publicacion_id`))) join `tipos_publicacion` `tp` on((`pt`.`tipo_id` = `tp`.`id`))) GROUP BY `pu`.`id`, `pu`.`titulo`, `pu`.`descripcion`, `pu`.`fecha_publicacion`, `cont_min`.`url` ORDER BY `pu`.`fecha_publicacion` DESC LIMIT 0, 4 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_publicaciones_completa`
--
DROP TABLE IF EXISTS `vista_publicaciones_completa`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_publicaciones_completa`  AS SELECT `pu`.`id` AS `id`, `pu`.`titulo` AS `titulo`, `pu`.`descripcion` AS `descripcion`, `pu`.`fecha_publicacion` AS `fecha_publicacion`, `cont_min`.`url` AS `imagen`, group_concat(distinct concat(`us`.`nombre`,' ',`us`.`apellido`) separator ', ') AS `autores`, group_concat(distinct `tp`.`nombre` separator ', ') AS `tipos` FROM (((((((`publicaciones` `pu` left join `publicacion_contenido` `pcont_min` on((`pu`.`id` = `pcont_min`.`publicacion_id`))) left join `contenido` `cont_min` on((`pcont_min`.`contenido_id` = `cont_min`.`id`))) left join `tipos_contenido` `tcont` on(((`cont_min`.`tipo_id` = `tcont`.`id`) and (`tcont`.`nombre` = 'miniatura')))) left join `publicacion_autor` `pa` on((`pu`.`id` = `pa`.`publicacion_id`))) left join `usuarios` `us` on((`pa`.`usuario_id` = `us`.`id`))) left join `publicacion_tipo` `pt` on((`pu`.`id` = `pt`.`publicacion_id`))) left join `tipos_publicacion` `tp` on((`pt`.`tipo_id` = `tp`.`id`))) GROUP BY `pu`.`id`, `pu`.`titulo`, `pu`.`descripcion`, `pu`.`fecha_publicacion`, `cont_min`.`url` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_publicaciones_detalle`
--
DROP TABLE IF EXISTS `vista_publicaciones_detalle`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_publicaciones_detalle`  AS SELECT `pu`.`id` AS `id`, `pu`.`titulo` AS `titulo`, `pu`.`descripcion` AS `descripcion`, `pu`.`fecha_publicacion` AS `fecha_publicacion`, `cont_min`.`url` AS `imagen`, group_concat(distinct concat(`us`.`nombre`,' ',`us`.`apellido`) separator ', ') AS `autores`, group_concat(distinct `tp`.`nombre` separator ', ') AS `tipos` FROM (((((((`publicaciones` `pu` join `publicacion_contenido` `pcont_min` on((`pu`.`id` = `pcont_min`.`publicacion_id`))) join `contenido` `cont_min` on((`pcont_min`.`contenido_id` = `cont_min`.`id`))) join `tipos_contenido` `tcont` on(((`cont_min`.`tipo_id` = `tcont`.`id`) and (`tcont`.`nombre` = 'miniatura')))) join `publicacion_autor` `pa` on((`pu`.`id` = `pa`.`publicacion_id`))) join `usuarios` `us` on((`pa`.`usuario_id` = `us`.`id`))) join `publicacion_tipo` `pt` on((`pu`.`id` = `pt`.`publicacion_id`))) join `tipos_publicacion` `tp` on((`pt`.`tipo_id` = `tp`.`id`))) GROUP BY `pu`.`id`, `pu`.`titulo`, `pu`.`descripcion`, `pu`.`fecha_publicacion`, `cont_min`.`url` ORDER BY `pu`.`fecha_publicacion` ASC ;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `contenido`
--
ALTER TABLE `contenido`
  ADD CONSTRAINT `contenido_ibfk_1` FOREIGN KEY (`tipo_id`) REFERENCES `tipos_contenido` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `publicacion_autor`
--
ALTER TABLE `publicacion_autor`
  ADD CONSTRAINT `fk_publicacion_autor` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `publicacion_autor_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `publicacion_contenido`
--
ALTER TABLE `publicacion_contenido`
  ADD CONSTRAINT `fk_publicacion_contenido` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `publicacion_contenido_ibfk_2` FOREIGN KEY (`contenido_id`) REFERENCES `contenido` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `publicacion_tipo`
--
ALTER TABLE `publicacion_tipo`
  ADD CONSTRAINT `fk_publicacion_tipo` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `publicacion_tipo_ibfk_2` FOREIGN KEY (`tipo_id`) REFERENCES `tipos_publicacion` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
