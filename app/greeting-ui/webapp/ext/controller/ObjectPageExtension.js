sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/TextArea",
    "sap/m/VBox",
    "sap/m/Label"
], function(MessageToast, Dialog, Button, TextArea, VBox, Label) {
    "use strict";

    return {
        responderConIA: function() {
            const oContext = this.getView().getBindingContext();
            const sId = oContext.getProperty("ID");
            const sUrl = `/odata/v4/incidencias/Incidencias(${sId})/responderConIA`;

            fetch(sUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            })
            .then(r => r.json())
            .then(() => {
                MessageToast.show("Incidencia respondida con la recomendación de la IA");
                oContext.refresh();
            })
            .catch(() => MessageToast.show("Error al responder con IA"));
        },

        responderManualmente: function() {
            const oContext = this.getView().getBindingContext();
            const sId = oContext.getProperty("ID");
            const oTextArea = new TextArea({ width: "100%", rows: 5, placeholder: "Escribe tu respuesta..." });

            const oDialog = new Dialog({
                title: "Responder manualmente",
                content: new VBox({
                    items: [
                        new Label({ text: "Respuesta:", design: "Bold" }),
                        oTextArea
                    ]
                }),
                beginButton: new Button({
                    text: "Enviar",
                    type: "Emphasized",
                    press: function() {
                        const sRespuesta = oTextArea.getValue().trim();
                        if (!sRespuesta) {
                            MessageToast.show("Escribe una respuesta antes de enviar");
                            return;
                        }
                        fetch(`/odata/v4/incidencias/Incidencias(${sId})/responderManualmente`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ respuesta: sRespuesta })
                        })
                        .then(() => {
                            MessageToast.show("Incidencia respondida correctamente");
                            oDialog.close();
                            oContext.refresh();
                        })
                        .catch(() => MessageToast.show("Error al enviar la respuesta"));
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function() { oDialog.close(); }
                })
            });

            this.getView().addDependent(oDialog);
            oDialog.open();
        }
    };
});