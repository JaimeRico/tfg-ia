sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (ControllerExtension, Fragment, MessageToast, MessageBox) {
    "use strict";

    return ControllerExtension.extend("greetingui.ext.controller.IncidenciasObjectPageExt", {
        override: {
            onInit: function () {
            }
        },

        onOpenResponderCerrarDialog: async function () {
            if (!this._oResponderDialog) {
                this._oResponderDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "greetingui.ext.fragment.ResponderCerrarDialog.fragment",
                    controller: this
                });

                this.getView().addDependent(this._oResponderDialog);
            }

            const oTextArea = sap.ui.core.Fragment.byId(
                this.getView().getId(),
                "respuestaRRHHTextArea"
            );

            if (oTextArea) {
                oTextArea.setValue("");
            }

            this._oResponderDialog.open();
        },

        onCancelarResponderYCerrar: function () {
            if (this._oResponderDialog) {
                this._oResponderDialog.close();
            }
        },

        onConfirmarResponderYCerrar: async function () {
            const oTextArea = sap.ui.core.Fragment.byId(
                this.getView().getId(),
                "respuestaRRHHTextArea"
            );

            const sRespuesta = oTextArea ? oTextArea.getValue().trim() : "";

            if (!sRespuesta) {
                MessageBox.warning("Debe escribir una respuesta antes de cerrar la incidencia.");
                return;
            }

            try {
                const oView = this.getView();
                const oContext = oView.getBindingContext();

                if (!oContext) {
                    MessageBox.error("No se ha encontrado el contexto de la incidencia.");
                    return;
                }

                const sPath = oContext.getPath();
                const oModel = oView.getModel();

                const oAction = oModel.bindContext(
                    sPath + "/IncidenciasService.responderYCerrar(...)"
                );

                oAction.setParameter("respuesta", sRespuesta);

                await oAction.invoke();

                if (this._oResponderDialog) {
                    this._oResponderDialog.close();
                }

                oModel.refresh();
                MessageToast.show("Incidencia respondida y cerrada correctamente.");
            } catch (e) {
                MessageBox.error(
                    e?.message || "Se ha producido un error al responder y cerrar la incidencia."
                );
            }
        }
    });
});