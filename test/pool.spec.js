const chance = require('chance')();
const {expect} = require('chai');
const {PromisePool} = require('../src/pool');

describe('Pool', () => {
    let fn;
    let fnResults;
    let concurrentExecutions;

    beforeEach(() => {
        let currentExecutions = 0;
        concurrentExecutions = 0;

        fnResults = chance.n(chance.string, 10);

        fn = result => {
            currentExecutions += 1;
            concurrentExecutions = Math.max(concurrentExecutions, currentExecutions);

            return new Promise(resolve => {
                setTimeout(() => {
                    currentExecutions -= 1;
                    resolve(result);
                }, 10);
            });
        };
    });

    it('should pool with the default of 1 max concurrent', async () => {
        const pool = new PromisePool(fn);

        const results = await Promise.all(
            fnResults.map(result => pool.run(result))
        );

        expect(results).to.eql(fnResults);
        expect(concurrentExecutions).to.eql(1);
    });

    it('should pool with 3 max concurrent', async () => {
        const pool = new PromisePool(fn, 3);

        const results = await Promise.all(
            fnResults.map(result => pool.run(result))
        );

        expect(results).to.eql(fnResults);
        expect(concurrentExecutions).to.eql(3);
    });
});
