-- Permite encontrar la primera portada y listar archivos sin recorrer toda la tabla.
CREATE INDEX "project_files_project_id_kind_created_at_idx"
ON "project_files" ("project_id", "kind", "created_at");
