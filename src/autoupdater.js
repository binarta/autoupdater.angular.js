angular.module('autoupdater', ['rest.client', 'notifications'])
    .factory('appstatus', [AppStatusFactory])
    .factory('autoupdater', ['restServiceHandler', 'appstatus', 'topicMessageDispatcher', AutoUpdateFactory])
    .run(['topicRegistry', 'topicMessageDispatcher', AppUpdatesNotifier]);

function AppStatusFactory() {
    return {};
}

function AutoUpdateFactory(restServiceHandler, appstatus, topicMessageDispatcher) {
    return function () {
        restServiceHandler({
            params: {
                method: 'GET',
                url: 'version.json'
            },
            success: function (app) {
                if (appstatus.version == undefined)
                    appstatus.version = app.version;
                if (appstatus.version != app.version) {
                    var shouldRaiseNotification = appstatus.updateVersion == undefined;
                    appstatus.updateVersion = app.version;
                    if (shouldRaiseNotification)
                        topicMessageDispatcher.fire('app.updates.available', 'ok');
                }
            }
        });
    }
}

function AppUpdatesNotifier(topicRegistry, topicMessageDispatcher) {
    topicRegistry.subscribe('app.updates.available', function () {
        topicMessageDispatcher.fire('system.info', {
            code: 'app.updates.available',
            default: 'Your application version is out of date. Refresh to update.',
            persistent: true
        });
    });
}

