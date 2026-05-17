const cds = require('@sap/cds');

module.exports = class DashboardService extends cds.ApplicationService {
  async init() {

    this.on('READ', 'DashboardKPIs', async () => {
      const db = await cds.connect.to('db');
      const { Incidencias } = db.entities('tfg');

      const all    = await db.run(SELECT.from(Incidencias));
      const total  = all.length;
      const abiertas = all.filter(i => ['nuevo','asignado','en_progreso','respondido'].includes(i.status)).length;
      const cerradas = all.filter(i => i.status === 'cerrado').length;
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
        const key = i.status || 'Sin estado';
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
