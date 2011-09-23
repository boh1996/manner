var parser = /^(\S+)\s*-\s*(\S+)\s+([^:]+):([^)]+)$/,
    groups = {
        'Barista': ['Ida','Julie','Luise','Mai','Maj','Michael','Morten','Uncas'],
        'Guide': ['Christian','Malene','Margrethe','Maria'],
        'P-vagt': ['Emil','J\u00f8rn','Rie','Jonathan'],
        'Mad': ['Anne','Kristine','Signe'],
        'Alle': ['Barista','Guide','P-vagt','Mad'],
        'Hejk': ['Uncas','Mai','Emil','Jonathan','Julie']
    },
    colors = {
        'Administration' : '#999',
        'Alle' : '#f39',
        'Banket': '#036',
        'Barista': '#909',
        'Fraværende': '#999',
        'Frokost': '#930',
        'Hejk': '#c30',
        'K\u00f8kken': '#0af',
        'Lejrbål': '#669',
        'Natl\u00f8b': '#336',
        'Opvask': '#0af',
        'Oprydning': '#f63',
        'P-vagt': '#393',
        'P-møde': '#066',
        'Settlers': '#336'
    };

var table = $('#persons'),
    thead = $('<thead>').appendTo(table),
    headerRow = $('<tr>').appendTo(thead).append('<td>'),
    tbody = $('<tbody>').appendTo(table),
    startHour = 7,
    intervalCount = 32,
    now = new Date();

for (var i = 0; i < intervalCount; i++) {
    var decimal = i / 2 + startHour,
        hours = Math.floor(decimal),
        minutes = decimal % 1 ? '30' : '00',
        label = hours + ':' + minutes;
        
    $('<th>').appendTo(headerRow).text(label);
}

function loadData(hash) {
    tbody.empty();
    
    $('h1 a').removeClass('selected')
        .filter('[href="' + hash + '"]').addClass('selected');
    
    $.get('data/' + hash.substring(1) + '.txt', function (data) {
        var persons = parseData(data);
        renderTable(persons);
    });
}

function parseData(data) {
    var lines = data.split('\n'),
        persons = {};
    
    for (var i in lines) {
        var tokens = lines[i].match(parser),
            entry = {
                start: tokens[1].trim(),
                end: tokens[2].trim(),
                startCol: parseTime(tokens[1]),
                endCol: parseTime(tokens[2]),
                text: tokens[3].trim()
            },
            atendees = _(tokens[4].split(',')).map(function (x) { return x.trim(); });
            
        entry.color = colors[entry.text] || colors[atendees[0]] || '#36c';
        
        while (atendees.length > 0) {
            var name = atendees.pop();
            if (groups[name]) {
                atendees = atendees.concat(groups[name]);
                continue;
            }
            
            if (!persons[name]) {
                persons[name] = [];
            }
            
            persons[name].push(entry);
        }
    }
    
    return persons;
}

function parseTime(text) {
    var tokens = text.split(':'),
        hours = parseInt(tokens[0], 10),
        minutes = parseInt(tokens[1], 10),
        decimal = hours + minutes / 60;
    
    return Math.round(2 * ( decimal - startHour ));
}

function renderTable(persons) {
    var names = _(persons).keys().sort(),
        currentCol = parseTime(now.getHours() + ':' + now.getMinutes());
    
    _(names).each(function (name) {
        var row = $('<tr>').appendTo(tbody),
            queue = persons[name],
            pointer = 0;
        
        $('<th>').text(name).appendTo(row);
        
        while (queue.length > 0) {
            var entry = queue.shift(),
                duration = entry.endCol - Math.max(entry.startCol, pointer);
                
            if (duration < 1) continue;
            
            while (pointer < entry.startCol) {
                row.append('<td>');
                pointer++;
            }
            
            $('<td>')
                .appendTo(row)
                .text(entry.text)
                .attr('title', entry.start + ' - ' + entry.end)
                .attr('colspan', duration)
                .css('background', entry.color)
                .css('font-size', Math.min(100, 40 + Math.ceil(300 * duration / entry.text.length)) + '%')
                .toggleClass('past', entry.endCol <= currentCol)
                .toggleClass('now', entry.endCol > currentCol && !row.children().is('.now'));
            
            pointer += duration;
        }
        
        while (pointer < intervalCount) {
            row.append('<td>');
            pointer++;
        }
    });
}

$(window).bind('hashchange', function () {
    loadData(location.hash);
});

if (location.hash) {
    loadData(location.hash);
}
else {
    var day = now.getDay(),
        hash = $('h1 a').eq(day).attr('href');
    
    loadData(hash);
}