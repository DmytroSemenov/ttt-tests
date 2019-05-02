mocha.setup('bdd');

let assert = chai.assert;

describe('Check message state changes', function() {
    let $container = document.getElementById('container');
    let $message = document.querySelector('[data-component = "showTurn"]');

    after(function() {
        $message.innerHTML = '';
        $container.classList.remove('waiting');
    });

    it('Message is set', function() {
        setWaitState('some message');

        assert.equal($message.innerHTML, 'some message');
        assert.isTrue($container.classList.contains('waiting'));
    });

    it('Message is removed', function() {
        removeWaitState('');
        
        assert.equal($message.innerHTML, '');
        assert.isFalse($container.classList.contains('waiting'));
    });
});

describe('Check start game behavior', function() {
    describe('Check behavior for valid response', function() {
        let sessionId = 'sessionId';
        let userName = 'userName';
        let response = Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ok: true, data: {
                id: sessionId,
                canMove: true
            }})
        });

        before(function() {
            /*
                Так как все функции лежат в глобальной области видимости,
                то все они принадлежат объекту window

                заменяем fetch, get, handleResponse фейками используя sinon
                
                fetch возвращает промис response

                get,handleResponse просто оборачиваются в фейк, они всё еще будут вызываться
                только у них появятся различные поля, например get.called в котором будет 'true'
                если функция была вызвана
            */
            sinon.replace(window, 'fetch', sinon.fake.returns(response));
            sinon.replace(window, 'get', sinon.fake(get));
            sinon.replace(window, 'handleResponse', sinon.fake(handleResponse));
        });

        after(function() {
            sinon.restore();

            payload.id = '';
            payload.name = '';
        });

        it('Check that "payload" is empty', function() {
            assert.equal(payload.id, '');
            assert.equal(payload.name, '');
        }); 

        it('Check that "start" returns promise', function(done) {
            let promise = start(userName);

            assert.isTrue(promise instanceof Promise);

            promise.then(() => done()); // подождать резолва промиса, перед тем, как выполнять остальные 'it'. Promive.resolve() всё еще асинхронная операция
        });

        it('Check that "get" is called', function() {
            assert.isTrue(get.called);
        });

        it('Check that "get" returns promise', function(done) {
            let promise = get('someUrl');

            assert.isTrue(promise instanceof Promise);

            promise.then(() => done());
        });

        it('Check that "handleResponse" is called', function() {
            assert.isTrue(handleResponse.called);
        });

        it('Check that "handleResponse" returns correct data', function(done) {
            fetch()
                .then(handleResponse)
                .then(function(data) {
                    assert.equal(data.id, sessionId)
                    assert.isTrue(data.canMove);

                    done();
                })
        });

        it('Check that "payload" is changed and is correct', function() {
            assert.equal(payload.id, sessionId);
            assert.equal(payload.name, userName);
        });
    });

    describe('Check behavior for invalid response', function() {

    });
});

mocha.run();