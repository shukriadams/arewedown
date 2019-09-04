let Handlebars = require('handlebars'),
    fs = require('fs'),
    ago = require('s-ago').default,
    pages = null,
    views,
    path = require('path'),
    layouts = require('handlebars-layouts');

function findViews(root){
    let views = [];

    function process(root){
        let items = fs.readdirSync(root);

        for (let i = 0; i < items.length; i ++){
            const file = path.join(root, items[i]);

            if (fs.statSync(file).isDirectory())
                process(file)
            else
                views.push(file);
        }
    }

    process(root);
    return views;
}    

Handlebars.registerHelper('ago', function(date){
    if (typeof date === 'string')
        date = new Date(date);

    return ago(date);
});

Handlebars.registerHelper('secondsFromNow', function(futureDate){
    if (typeof futureDate === 'string')
        futureDate = new Date(futureDate);

    
    return Math.floor((futureDate.getTime() - Date.now()) / 1000);
});

Handlebars.registerHelper('time', function(date){
    if (typeof date === 'string')
        date = new Date(date);

    return date.toLocaleTimeString();
});



Handlebars.registerHelper(layouts(Handlebars));


module.exports = {

    getView: function(page){

        if (!pages){

            pages = {};
            views = {};
        
            // partials
            let partialPaths = findViews(path.join(__dirname,'./../views/partials'));
            for (let partialPath of partialPaths){
                let content = fs.readFileSync(partialPath, 'utf8'),
                    name = path.basename(partialPath).match(/(.*).hbs/).pop(); 

                if (views[name]){
                    console.warn(`The partial "${name}" (from view ${partialPath}) is already taken by another partial.`);
                    continue;
                }    

                Handlebars.registerPartial(name, content);
                views[name] = true;
            }
        
            // pages
            let pagePaths = findViews(path.join(__dirname, './../views/pages'));
            for (let pagePath of pagePaths){
                let content = fs.readFileSync(pagePath, 'utf8'),
                    name = path.basename(pagePath).match(/(.*).hbs/).pop();

                if (pages[name]){
                    console.warn(`The page "${name}" (from view ${pagePath}) is already taken by another view.`);
                    continue;
                }    
                    
                pages[name] = Handlebars.compile(content);
            }
        }

        return pages[page];
    },
    
};
