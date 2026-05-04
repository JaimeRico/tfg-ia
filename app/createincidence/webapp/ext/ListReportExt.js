sap.ui.define([], function () {
    "use strict";

    return {
        onOpenCreateView: function () {
            window.open("/greeting-ui/index.html", "_blank");
        }
    };
});