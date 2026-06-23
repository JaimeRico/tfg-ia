sap.ui.define([], function () {
    "use strict";

    return {
        onOpenCreateView: function () {
            window.open("/tfgia.createincidence/index.html?role=empleado&sap-ui-xx-viewCache=false", "_blank");
        }
    };
});
