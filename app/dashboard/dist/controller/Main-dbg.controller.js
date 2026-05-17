sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("dashboard.controller.Main", {

        onInit: function () {
            var oModel = new JSONModel({
                kpis: { total: 0, abiertas: 0, cerradas: 0, needsReview: 0 },
                departamento: [],
                categoria: [],
                estado: [],
                mes: []
            });
            this.getView().setModel(oModel, "mainModel");
            this._loadData();
        },

        _loadData: function () {
            var that = this;
            var sBase = "/odata/v4/dashboard/";

            // KPIs
            fetch(sBase + "DashboardKPIs")
                .then(function(r){ return r.json(); })
                .then(function(d){
                    var kpi = d.value[0] || {};
                    that.getView().getModel("mainModel").setProperty("/kpis", {
                        total: kpi.total || 0,
                        abiertas: kpi.abiertas || 0,
                        cerradas: kpi.cerradas || 0,
                        needsReview: kpi.needsReview || 0
                    });
                });

            // Departamento
            fetch(sBase + "DashboardPorDepartamento")
                .then(function(r){ return r.json(); })
                .then(function(d){
                    that.getView().getModel("mainModel").setProperty("/departamento", d.value || []);
                });

            // Categoría
            fetch(sBase + "DashboardPorCategoria")
                .then(function(r){ return r.json(); })
                .then(function(d){
                    that.getView().getModel("mainModel").setProperty("/categoria", d.value || []);
                });

            // Estado
            fetch(sBase + "DashboardPorEstado")
                .then(function(r){ return r.json(); })
                .then(function(d){
                    that.getView().getModel("mainModel").setProperty("/estado", d.value || []);
                });

            // Mes
            fetch(sBase + "DashboardPorMes")
                .then(function(r){ return r.json(); })
                .then(function(d){
                    that.getView().getModel("mainModel").setProperty("/mes", d.value || []);
                });
        }
    });
});
