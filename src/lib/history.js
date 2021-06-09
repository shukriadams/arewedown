module.exports = {

    /**
     * Marks a item as passing. returns true if the item status changed since the last status write
     * @param {string} safeName Name of watcher or listener, file-system safe
     * @param {Date} date Date of the event being marked.
     */
    async writePassing(safeName, date){
        let settings = require('./settings').get(),
            fs = require('fs-extra'),
            path = require('path'),
            log = require('./../lib/logger').instance(),
            downFlag = path.join(settings.logs, safeName, 'flag'),
            changed = false,
            downDate = null,
            historyLogFolder = path.join(settings.logs, safeName, 'history')

        await fs.ensureDir(historyLogFolder)

        await fs.writeJson(path.join(historyLogFolder, `status.json`), {
            status : 'up',
            date 
        })

        // site is back up after fail was previous detected, clean up flag and write log
        if (await fs.exists(downFlag)){
            
            try {
                downDate = (await fs.readJson(downFlag)).date
            } catch(ex){
                log.error(`Downflag "${downFlag}" is corrupt`)
            }

            await fs.remove(downFlag)

            await fs.writeJson(path.join(historyLogFolder, `${date.getTime()}.json`), {
                status : 'up',
                date
            })

            changed = true
        }

        // if no history exists, write start entry, status flag counts for 1, history will be 1 more
        if ((await fs.readdir(historyLogFolder)).length < 2)
            await fs.writeJson(path.join(historyLogFolder, `${date.getTime()}.json`), {
                status : 'up',
                date 
            })

        return { 
            changed,
            downDate
        }
    },
    
    async getLastEvent(safeName){
        let settings = require('./settings').get(),
            log = require('./../lib/logger').instance(),
            path = require('path'),
            fsUtils = require('madscience-fsUtils'),
            fs = require('fs-extra'),
            historyLogFolder = path.join(settings.logs, safeName, 'history')

        if (!await fs.exists(historyLogFolder))
            return null
        
        const history = await fsUtils.readFilesInDir(historyLogFolder)
        if (!history.length)
            return null

        try {
            const event = await fs.readJson(history.sort()[0])
            return event
        } catch (ex){
            log.error(`Failed to load history for "${safeName}":`, ex)
            return null
        }
    },

    async writeFailing(safeName, date, error){
        let settings = require('./settings').get(),
            fs = require('fs-extra'),
            path = require('path'),
            downFlag = path.join(settings.logs, safeName, 'flag'),
            changed = false,
            historyLogFolder = path.join(settings.logs, safeName, 'history')

        if (!await fs.exists(downFlag)){

            await fs.ensureDir(historyLogFolder)

            // site is down, write fail flag and log
            await fs.writeJson(downFlag, { date })

            await fs.writeJson(path.join(historyLogFolder, `${date.getTime()}.json`), {
                status : 'down',
                date,
                error
            })

            await fs.writeJson(path.join(historyLogFolder, `status.json`), {
                status : 'down',
                date : this.lastRun
            })

            changed = true
        }

        return {
            changed
        }

    }
}
