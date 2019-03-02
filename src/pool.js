function PromisePool(fn, maxConcurrent = 1) {
    const queue = [];

    return {
        run(...args) {
            return new Promise((resolve, reject) => {
                queue.push({args, resolve, reject});
                processQueue();
            });
        }
    };

    function processQueue() {
        const inFlight = queue.filter(({running}) => running).length;
        if (inFlight >= maxConcurrent) return;

        const nextToSend = queue.find(({running}) => !running);
        if (!nextToSend) return;

        const {args, resolve, reject} = nextToSend;

        nextToSend.running = true;

        function finished(err, result) {
            if (err) reject(err);
            if (!err) resolve(result);
            queue.splice(queue.indexOf(nextToSend), 1);
            processQueue();
        }

        fn(...args).then(finished.bind(null, null), finished);
        processQueue();
    }
}

module.exports = {PromisePool};
