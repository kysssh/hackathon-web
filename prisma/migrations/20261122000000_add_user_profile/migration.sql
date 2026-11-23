-- Perfil del participante: nombres, apellidos y universidad.
-- Columnas opcionales para no romper a los usuarios que ya existen; la app pide
-- completarlas en /completar-perfil antes de crear o unirse a un equipo.
ALTER TABLE "users" ADD COLUMN "first_name" TEXT;
ALTER TABLE "users" ADD COLUMN "last_name" TEXT;
ALTER TABLE "users" ADD COLUMN "university" TEXT;
