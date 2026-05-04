service DashboardService {
  entity DashboardKPIs {
    key ID      : String;
    total       : Integer;
    abiertas    : Integer;
    cerradas    : Integer;
    needsReview : Integer;
  }
  entity DashboardPorDepartamento {
    key dimension : String;
    total         : Integer;
  }
  entity DashboardPorCategoria {
    key dimension : String;
    total         : Integer;
  }
  entity DashboardPorEstado {
    key dimension : String;
    total         : Integer;
  }
  entity DashboardPorMes {
    key dimension : String;
    total         : Integer;
  }
}