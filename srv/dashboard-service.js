const cds = require('@sap/cds');

module.exports = class DashboardService extends cds.ApplicationService {
  async init() {

    this.on('READ', 'DashboardKPIs', async () => {
      const db = await cds.connect.to('db');
      const { Incidencias } = db.entities('tfg');

      const all    = await db.run(SELECT.from(Incidencias));
      const total  = all.length;
      // En el flujo de la demo, cuando RRHH responde una incidencia,
      // el servicio la marca como "respondido". Para el dashboard,
      // ese estado debe contar como resuelto/cerrado, no como abierto.
      const estadosAbiertos = ['nuevo', 'asignado', 'en_progreso'];
      const estadosCerrados = ['respondido', 'cerrado', 'resuelto'];

      const abiertas = all.filter(i => estadosAbiertos.includes(i.status)).length;
      const cerradas = all.filter(i => estadosCerrados.includes(i.status)).length;
      const needsReview = all.filter(i => i.needs_review === true).length;

      return [{ ID: 'kpi-1', total, abiertas, cerradas, needsReview }];
    });

    this.on('READ', 'DashboardPorDepartamento', async () => {
      const db = await cds.connect.to('db');
      const { Incidencias } = db.entities('tfg');
      const all = await db.run(SELECT.from(Incidencias).columns('department'));
      const map = {};
      all.forEach(i => {
        const key = i.department || 'Sin departamento';
        map[key] = (map[key] || 0) + 1;
      });
      return Object.entries(map).map(([dimension, total]) => ({ dimension, total }));
    });

    this.on('READ', 'DashboardPorCategoria', async () => {
      const db = await cds.connect.to('db');
      const { Incidencias } = db.entities('tfg');
      const all = await db.run(SELECT.from(Incidencias).columns('category'));
      const map = {};
      all.forEach(i => {
        const key = i.category || 'Sin categoría';
        map[key] = (map[key] || 0) + 1;
      });
      return Object.entries(map).map(([dimension, total]) => ({ dimension, total }));
    });

    this.on('READ', 'DashboardPorEstado', async () => {
      const db = await cds.connect.to('db');
      const { Incidencias } = db.entities('tfg');
      const all = await db.run(SELECT.from(Incidencias).columns('status'));
      const map = {};
      all.forEach(i => {
        let key = i.status || 'Sin estado';

        // Mostrar el mismo concepto que ve el empleado: una incidencia
        // respondida por RRHH se considera resuelta.
        if (key === 'respondido' || key === 'cerrado') key = 'resuelto';

        map[key] = (map[key] || 0) + 1;
      });
      return Object.entries(map).map(([dimension, total]) => ({ dimension, total }));
    });

    this.on('READ', 'DashboardPorMes', async () => {
      const db = await cds.connect.to('db');
      const { Incidencias } = db.entities('tfg');
      const all = await db.run(SELECT.from(Incidencias).columns('createdAt'));
      const map = {};
      all.forEach(i => {
        if (i.createdAt) {
          const key = i.createdAt.substring(0, 7);
          map[key] = (map[key] || 0) + 1;
        }
      });
      return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dimension, total]) => ({ dimension, total }));
    });

    await super.init();
  }
};
