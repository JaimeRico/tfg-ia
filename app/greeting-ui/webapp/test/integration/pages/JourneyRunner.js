sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"greetingui/test/integration/pages/GreetingsList",
	"greetingui/test/integration/pages/GreetingsObjectPage"
], function (JourneyRunner, GreetingsList, GreetingsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('greetingui') + '/test/flp.html#app-preview',
        pages: {
			onTheGreetingsList: GreetingsList,
			onTheGreetingsObjectPage: GreetingsObjectPage
        },
        async: true
    });

    return runner;
});

