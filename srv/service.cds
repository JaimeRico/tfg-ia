using { tfg as db } from '../db/schema';

service IncidenciasService {
  entity Incidencias as projection on db.Incidencias;
    /*action responderYCerrar(respuesta : String(2000)) returns Incidencias;*/
}
