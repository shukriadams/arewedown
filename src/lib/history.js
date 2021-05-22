module.exports = {

    /**
     * Marks a item as passing. returns true if the item status changed since the last status write
     * @param {string} safeName Name of watcher or listener, file-system safe
     * @param {Date} date Date of the event being marked.
     */
    async writePassing(safeName, date){
        let settings = require('./settings'),
            fs = require('fs-extra'),
            path = require('path'),
            downFlag = path.join(settings.logs, safeName, 'flag'),
            statusChanged = false,
            historyLogFolder = path.join(settings.logs, safeName, 'history')

        await fs.ensureDir(historyLogFolder)

        await fs.writeJson(path.join(historyLogFolder, `status.json`), {
            status : 'up',
            date 
        })

        // site is back up after fail was previous detected, clean up flag and write log
        if (await fs.exists(downFlag)){
            await fs.remove(downFlag)

            await fs.writeJson(path.join(historyLogFolder, `${date.getTime()}.json`), {
                status : 'up',
                date
            })

            statusChanged = true
        }

        // if no history exists, write start entry, status flag counts for 1, history will be 1 more
        if ((await fs.readdir(historyLogFolder)).length < 2)
            await fs.writeJson(path.join(historyLogFolder, `${date.getTime()}.json`), {
                status : 'up',
                date 
            })

        return statusChanged
    },

    async writeFailing(safeName, date){
        let settings = require('./settings'),
            fs = require('fs-extra'),
            path = require('path'),
            downFlag = path.join(settings.logs, safeName, 'flag'),
            statusChanged = false,
            historyLogFolder = path.join(settings.logs, safeName, 'history')

        if (!await fs.exists(downFlag)){

            await fs.ensureDir(historyLogFolder)

            // site is down, write fail flag and log
            await fs.writeJson(downFlag, { date })

            await fs.writeJson(path.join(historyLogFolder, `${date.getTime()}.json`), {
                status : 'down',
                date 
            })

            await fs.writeJson(path.join(historyLogFolder, `status.json`), {
                status : 'down',
                date : this.lastRun
            })

            statusChanged = true
        }

        return statusChanged
    }
}