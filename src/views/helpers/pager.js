module.exports = Handlebars => {

    /**
     * @params {PageableData} pageObject
     */
    Handlebars.registerHelper('pager', function(baseUrl, pageObject){
        let settings = require('./../../lib/settings').get(),
            html = '<ul class="pager">',
            currentGroup = Math.floor(pageObject.index / settings.pagesPerGroup)

            let totalPages = Math.floor(pageObject.totalItems / settings.pageSize)
            if (pageObject.totalItems % settings.pageSize > 0)
                totalPages ++

            // not enough data to page, return empty bar
            if (totalPages < 2) 
                return

            let totalGroups = Math.floor(pageObject.totalItems / (settings.pageSize * settings.pagesPerGroup))
            if (pageObject.totalItems % (settings.pageSize * settings.pagesPerGroup) > 0)
                totalGroups ++

            let actualPagesInGroup = settings.pagesPerGroup
            if (currentGroup === totalGroups - 1 && totalPages % settings.pagesPerGroup > 0)
                actualPagesInGroup = totalPages % settings.pagesPerGroup

        
        if (currentGroup > 0){
            const back = ((currentGroup * settings.pagesPerGroup) - 1)
            html += `<li><a class="pager-anchor" href="${baseUrl}&page=${back + 1}">&laquo;</a></li>`
        }

        for (let i = 0 ; i < actualPagesInGroup ; i ++){
            let pageIndex = (currentGroup * settings.pagesPerGroup) + i

            html += `<li>`
            if (pageObject.index === pageIndex)
               html += `<span class="pager-anchor --active">${(pageIndex + 1)}<span>`
            else
                html += `<a class="pager-anchor" href="${baseUrl}&page=${pageIndex + 1}">${pageIndex + 1}</a>`
            html += `</li>`
        }

        if (currentGroup < totalGroups - 1){
            const forward = (currentGroup + 1) * settings.pagesPerGroup
            html += `<li><a class="pager-anchor" href="${baseUrl}&page=${forward + 1}">&raquo;</a></li>`
        }

        html += '</ul>'

        return html
    })
    
}