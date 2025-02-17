#!/bin/bash

# Solicitar el usuario y la contraseña de MySQL
echo -n "Introduce el usuario de MySQL: "
read usuario
echo -n "Introduce la contraseña de MySQL: "
read -s contrasena
echo

# Comando SQL para crear la base de datos, las tablas y el nuevo usuario
sql="CREATE DATABASE IF NOT EXISTS noticias_db;
USE noticias_db;

CREATE TABLE IF NOT EXISTS noticias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    filial VARCHAR(100) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS noticias_backup (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    filial VARCHAR(100),
    fecha TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS servidores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ip VARCHAR(255) NOT NULL,
    estado VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Crear el usuario Computos con contraseña espepa y otorgar permisos
CREATE USER IF NOT EXISTS 'Computos'@'localhost' IDENTIFIED BY 'espepa';
GRANT ALL PRIVILEGES ON noticias_db.* TO 'Computos'@'localhost';
FLUSH PRIVILEGES;"

# Ejecutar el comando SQL en MySQL
mysql -u "$usuario" -p"$contrasena" -e "$sql"

echo "Base de datos, tablas y usuario 'Computos' creados exitosamente."
