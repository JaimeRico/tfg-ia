using { tfg as db } from '../../db/schema';

service IncidenciasService {
  entity Incidencias as projection on db.Incidencias;
}