-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 02, 2024 at 07:22 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `manzanotas`
--

-- --------------------------------------------------------

--
-- Table structure for table `manzanas`
--

CREATE TABLE `manzanas` (
  `id_m` int(11) NOT NULL,
  `nombre_manzana` varchar(100) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `manzanas`
--

INSERT INTO `manzanas` (`id_m`, `nombre_manzana`, `direccion`) VALUES
(1, 'chapi', 'wasa wasa'),
(2, 'bosa', 'dubai'),
(3, 'suba', 'cuarto piso');

-- --------------------------------------------------------

--
-- Table structure for table `m_s`
--

CREATE TABLE `m_s` (
  `id_m1` int(11) NOT NULL,
  `id_s1` int(11) NOT NULL,
  `Fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `m_s`
--

INSERT INTO `m_s` (`id_m1`, `id_s1`, `Fecha`) VALUES
(1, 6, NULL),
(1, 1, NULL),
(1, 2, NULL),
(1, 3, NULL),
(1, 4, NULL),
(1, 5, NULL),
(2, 6, NULL),
(2, 4, NULL),
(2, 5, NULL),
(2, 7, NULL),
(3, 6, NULL),
(3, 3, NULL),
(3, 8, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `servicios`
--

CREATE TABLE `servicios` (
  `ud_servicios` int(11) NOT NULL,
  `nombre_servicios` varchar(100) NOT NULL,
  `tipo` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `servicios`
--

INSERT INTO `servicios` (`ud_servicios`, `nombre_servicios`, `tipo`) VALUES
(1, 'clases b', 'entretenimiento'),
(2, 'cine', 'Entretenimiento'),
(3, 'piscina', 'deporte'),
(4, 'GYM', 'deporte'),
(5, 'cocina', 'Gastronomia'),
(6, 'lavanderia', 'Aseo'),
(7, 'coser', 'maquinaria'),
(8, 'Yoga', 'Deporte');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuarios` int(11) NOT NULL,
  `nombre_usuarios` varchar(150) NOT NULL,
  `tipo_documento` varchar(100) NOT NULL,
  `documento` int(15) NOT NULL,
  `rol` varchar(100) NOT NULL,
  `id_m2` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id_usuarios`, `nombre_usuarios`, `tipo_documento`, `documento`, `rol`, `id_m2`) VALUES
(1, 'Hector', 'TI', 1028662738, '', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `manzanas`
--
ALTER TABLE `manzanas`
  ADD PRIMARY KEY (`id_m`);

--
-- Indexes for table `m_s`
--
ALTER TABLE `m_s`
  ADD KEY `fk_id2` (`id_m1`),
  ADD KEY `fk_id3` (`id_s1`);

--
-- Indexes for table `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`ud_servicios`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuarios`),
  ADD UNIQUE KEY `documento` (`documento`),
  ADD KEY `fk_id1` (`id_m2`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `manzanas`
--
ALTER TABLE `manzanas`
  MODIFY `id_m` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `servicios`
--
ALTER TABLE `servicios`
  MODIFY `ud_servicios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuarios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `m_s`
--
ALTER TABLE `m_s`
  ADD CONSTRAINT `fk_id2` FOREIGN KEY (`id_m1`) REFERENCES `manzanas` (`id_m`),
  ADD CONSTRAINT `fk_id3` FOREIGN KEY (`id_s1`) REFERENCES `servicios` (`ud_servicios`);

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_id1` FOREIGN KEY (`id_m2`) REFERENCES `manzanas` (`id_m`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
