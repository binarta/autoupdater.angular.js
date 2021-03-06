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
            expect(app.updateVersion).toBeUndefined();
        });

        describe('when checking for updates', function () {
            var args, params;
            var versionContext = {
                version: 1
            };
            var retrieveVersionInfo = function () {
                args.success(versionContext);
            };

            beforeEach(inject(function (restServiceHandler) {
                updater();
                args = restServiceHandler.calls.first().args[0];
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

                it('then app version is known', function () {
                    expect(app.version).toEqual(1);
                });

                it('then no app change event should be raised', function () {
                    expect(topics['app.updates.available']).toBeUndefined();
                });

                it('then no system event should be raised', function () {
                    expect(topics['system.info']).toBeUndefined();
                });
            });

            describe('and version differs from current', function () {
                beforeEach(function () {
                    app.version = 0;
                });
                beforeEach(retrieveVersionInfo);

                it('then update version is known', function () {
                    expect(app.version).toEqual(0);
                    expect(app.updateVersion).toEqual(1);
                });

                it('then an app change event should be raised', function () {
                    expect(topics['app.updates.available']).toBeDefined();
                });

                describe('and additional version updates are detected', function() {
                    beforeEach(function() {
                        versionContext.version = 2;
                        topics['app.updates.available'] = undefined;
                    });
                    beforeEach(retrieveVersionInfo);

                    it('then no more app change events should be raised', function () {
                        expect(topics['app.updates.available']).toBeUndefined();
                    });
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