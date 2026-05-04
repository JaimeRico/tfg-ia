const cds = require('@sap/cds');

module.exports = class DashboardService extends cds.ApplicationService {
  async init() {

    this.on('READ', 'DashboardKPIs', async () => {
      const Incidencias = 'IncidenciasService.Incidencias';
      const totalRow       = await SELECT.one.from(Incidencias).columns`count(*) as total`;
      const abiertasRow    = await SELECT.one.from(Incidencias).columns`count(*) as total`
        .where({ status: { 'in': ['nuevo', 'asignado', 'en_progreso', 'respondido'] } });
      const cerradasRow    = await SELECT.one.from(Incidencias).columns`count(*) as total`
        .where({ status: 'cerrado' });
      const needsReviewRow = await SELECT.one.from(Incidencias).columns`count(*) as total`
        .where({ needs_review: true });

      return [{
        ID:          'kpi-1',
        total:       parseInt(totalRow?.total)       || 0,
        abiertas:    parseInt(abiertasRow?.total)    || 0,
        cerradas:    parseInt(cerradasRow?.total)    || 0,
        needsReview: parseInt(needsReviewRow?.total) || 0
      }];
    });

    this.on('READ', 'DashboardPorDepartamento', async () => {
      const rows = await cds.run(`
        SELECT COALESCE(department, 'Sin departamento') as dimension, COUNT(*) as total
        FROM IncidenciasService_Incidencias
        GROUP BY department ORDER BY total DESC
      `);
      return rows.map(r => ({ dimension: r.dimension, total: parseInt(r.total) || 0 }));
    });

    this.on('READ', 'DashboardPorCategoria', async () => {
      const rows = await cds.run(`
        SELECT COALESCE(category, 'Sin categoría') as dimension, COUNT(*) as total
        FROM IncidenciasService_Incidencias
        GROUP BY category ORDER BY total DESC
      `);
      return rows.map(r => ({ dimension: r.dimension, total: parseInt(r.total) || 0 }));
    });

    this.on('READ', 'DashboardPorEstado', async () => {
      const rows = await cds.run(`
        SELECT COALESCE(status, 'Sin estado') as dimension, COUNT(*) as total
        FROM IncidenciasService_Incidencias
        GROUP BY status ORDER BY total DESC
      `);
      return rows.map(r => ({ dimension: r.dimension, total: parseInt(r.total) || 0 }));
    });

    this.on('READ', 'DashboardPorMes', async () => {
      const rows = await cds.run(`
        SELECT SUBSTRING(TO_CHAR(createdAt, 'YYYY-MM'), 1, 7) as dimension, COUNT(*) as total
        FROM IncidenciasService_Incidencias
        GROUP BY SUBSTRING(TO_CHAR(createdAt, 'YYYY-MM'), 1, 7)
        ORDER BY dimension
      `);
      return rows.map(r => ({ dimension: r.dimension, total: parseInt(r.total) || 0 }));
    });

    await super.init();
  }
};