const fs = require('fs')
const parser = require('csv-parse')
const taxo = JSON.parse(fs.readFileSync('./data/subject-name.json', { encoding: 'utf-8' }))
const compare = require('string-similarity').compareTwoStrings

let stats = {
    "authorities": 0,
    "similar": 0,
    "similar but not equal": 0
}

fs.createReadStream('./data/koha-authorities.csv')
    .pipe(parser({delimiter: ','}))
    .on('data', function(row) {
        stats["authorities"]++

        taxo.results.forEach( d => {
            let koha_auth = row[0].trim()
            koha_auth = koha_auth.replace(/\.$/, '')
            let equella_term = d.term.trim()
            equella_term = equella_term.replace(/\.$/, '')
            let similarity = compare(koha_auth, equella_term)

            if (similarity > 0.9) {
                stats["similar"]++

                if (koha_auth != equella_term) {
                    stats["similar but not equal"]++
                    console.log(`Similar:\n"${equella_term}" (EQUELLA)\n"${koha_auth}" (Koha)`)
                }
            }
        })
    })
    .on('end',function() {
        console.log('...finished\n')
        stats["success rate"] = (1 - stats["similar but not equal"]/stats["similar"]) * 100
        stats["success rate"] = stats["success ratio"].toFixed(2)
        console.log(stats)
    });
