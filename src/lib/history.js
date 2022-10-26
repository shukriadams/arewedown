const timebelt = require('timebelt')

module.exports = {

    dateToFilename(date){
        return timebelt.toShort(date, 'd_t', 'y-m-d', 'h-m-s')
    },

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
        }, { spaces: 4})

        // site is back up after fail was previous detected, clean up flag and write log
        if (await fs.exists(downFlag)){
            
            try {
                downDate = (await fs.readJson(downFlag)).date
            } catch(ex){
                log.error(`Downflag "${downFlag}" is corrupt`)
            }

            await fs.remove(downFlag)

            await fs.writeJson(path.join(historyLogFolder, `${this.dateToFilename(date)}.json`), {
                status : 'up',
                date
            }, { spaces: 4})

            changed = true
        }

        // if no history exists, write start entry, status flag counts for 1, history will be 1 more
        if ((await fs.readdir(historyLogFolder)).length < 2)
            await fs.writeJson(path.join(historyLogFolder, `${this.dateToFilename(date)}.json`), {
                status : 'up',
                date 
            }, { spaces: 4})

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
        
        let history = await fsUtils.readFilesInDir(historyLogFolder)
        history = history.filter(item => !item.includes('status.json'))
        let historyPath

        if (history.length){
            historyPath = history.sort()[history.length - 1]
        } else {
            // no events found, so treat status as an event, this will contain data watcher first ran
            historyPath = path.join(historyLogFolder, 'status.join')
        }

        try {
            const event = await fs.readJson(history.sort()[history.length - 1])
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
            await fs.writeJson(downFlag, { date }, { spaces: 4})

            await fs.writeJson(path.join(historyLogFolder, `${this.dateToFilename(date)}.json`), {
                status : 'down',
                date,
                error
            }, { spaces: 4})

            await fs.writeJson(path.join(historyLogFolder, `status.json`), {
                status : 'down',
                date : this.lastRun
            }, { spaces: 4})

            changed = true
        }

        return {
            changed
        }

    }
}
