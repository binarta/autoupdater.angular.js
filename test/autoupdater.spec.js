describe('autoupdater', function () {
    beforeEach(module('autoupdater'));

    describe('given an initial load of the app', function () {
        var app, updater, topics;

        beforeEach(inject(function (appstatus, autoupdater, topicMessageDispatcherMock) {
            app = appstatus;
            updater = autoupdater;
            topics = topicMessageDispatcherMock;
        }));

        it('then the app version should be undefined', function () {
            expect(app.version).toBeUndefined();
        });

        describe('when checking for updates', function () {
            var args, params;
            var retrieveVersionInfo = function () {
                args.success({
                    version: 1
                });
            };

            beforeEach(inject(function (restServiceHandler) {
                updater();
                args = restServiceHandler.calls[0].args[0];
                params = args.params;
            }));

            it('then a rest lookup is performed', function () {
                expect(params).toEqual({
                    method: 'GET',
                    url: 'version.json'
                });
            });

            describe('and version info is retrieved', function () {
                beforeEach(retrieveVersionInfo);

                it('then app version is defined', function () {
                    expect(app.version).toEqual(1);
                });

                it('then no app change event should be raised', function () {
                    expect(topics['app.updates.available']).toBeUndefined();
                });

                it('then no system should be raised', function () {
                    expect(topics['system.info']).toBeUndefined();
                });
            });

            describe('and version differs from current', function () {
                beforeEach(function () {
                    app.version = 0;
                });
                beforeEach(retrieveVersionInfo);

                it('then an app change event should be raised', function () {
                    expect(topics['app.updates.available']).toBeDefined();
                });
            });
        });

        describe('when an app change event is raised', function() {
            beforeEach(inject(function(topicRegistryMock) {
                topicRegistryMock['app.updates.available']()
            }));

            it('then a system event should be raised', function () {
                expect(topics['system.info']).toEqual({
                    code: 'app.updates.available',
                    default: 'Your application version is out of date. Refresh to update.',
                    persistent: true
                });
            });
        });
    });
});