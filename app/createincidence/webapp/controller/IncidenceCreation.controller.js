sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("tfgia.createincidence.controller.IncidenceCreation", {
        onInit: function () {
        },

        onCreateIncident: async function () {
            const oView = this.getView();
            const sSubject = oView.byId("subjectInput").getValue().trim();
            const sBody = oView.byId("bodyInput").getValue().trim();
            const sLanguage = oView.byId("languageInput").getValue().trim() || "es";

            if (!sSubject || !sBody) {
                MessageBox.warning("Debes rellenar el asunto y la descripción.");
                return;
            }

            const oPayload = {
                subject: sSubject,
                body: sBody,
                language: sLanguage,
                status: "nuevo"
            };

            try {
                const oResponse = await fetch("/odata/v4/incidencias/Incidencias", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(oPayload)
                });

                if (!oResponse.ok) {
                    const sErrorText = await oResponse.text();
                    throw new Error(sErrorText || "Respuesta no válida del servidor");
                }

                MessageToast.show("Incidencia creada correctamente.");

                oView.byId("subjectInput").setValue("");
                oView.byId("bodyInput").setValue("");
                oView.byId("languageInput").setValue("es");

                setTimeout(function () {
                    window.location.href = "/greetinui/index.html?role=empleado&sap-ui-xx-viewCache=false";
                }, 900);
            } catch (oError) {
                console.error("Error creando incidencia:", oError);
                MessageBox.error("Error al crear la incidencia. Revisa la API key de Anthropic o activa un modo demo sin IA.");
            }
        },

        onGoToMyIncidents: function () {
            window.location.href = "/greetinui/index.html?role=empleado&sap-ui-xx-viewCache=false";
        },

        onGoToRRHH: function () {
            window.location.href = "/greetinui/index.html?role=rrhh&sap-ui-xx-viewCache=false";
        }
    });
});
