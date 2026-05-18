using { tfg as db } from '../db/schema';

service IncidenciasService {
    entity Incidencias as projection on db.Incidencias
        actions {
            action responderConIA() returns String;
            action responderManualmente(respuesta : String) returns String;
        };
}