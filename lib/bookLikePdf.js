const async = require('async');
const hummus = require('hummus');

const A4_x = 595;
const A4_y = 842;
const a4_y_half = A4_y / 2;

/**
 * @param {String} filePath
 * @param {Number} sheetsInPile
 * @param {Callback} done
 */
module.exports = function(filePath, sheetsInPile, done) {
    var bookWriter = hummus.createWriter(filePath.replace(/\.pdf$/i, '#elch_yan.pdf'));
    var originalPDFContext = bookWriter.createPDFCopyingContext(filePath);

    var numberOfPages = originalPDFContext.getSourceDocumentParser().getPagesCount();
    
    var pageIndex = 0;
    var mergedPagesCount = 0;
    async.whilst(() => mergedPagesCount < numberOfPages, function(callback) {
       let originalIndexes = getOriginalIndexes(pageIndex),
            firstIndex = originalIndexes.firstIndex, 
            secondIndex = originalIndexes.secondIndex;

        //Creating A4 format blank page rotated by 90 degrees
        var page = bookWriter.createPage(0,0,A4_y,A4_x);

        var pageContent = bookWriter.startPageContentContext(page);

        if(firstIndex < numberOfPages) {
            let pageSize = getPagesSize(firstIndex);
            pageContent.q().cm(a4_y_half/pageSize.x, 0, 0, A4_x/pageSize.y, 0, 0);
            
            //Placing first page
            originalPDFContext.mergePDFPageToPage(page, firstIndex);
            mergedPagesCount++;
        }

        if(secondIndex < numberOfPages) {
            let pageSize = getPagesSize(secondIndex);
            let secondPageFormId = originalPDFContext.createFormXObjectFromPDFPage(secondIndex, hummus.ePDFPageBoxMediaBox);

            //Placing Second page
            pageContent.Q()
                .q()
                .cm(a4_y_half/pageSize.x, 0, 0, A4_x/pageSize.y, a4_y_half, 0)
                .doXObject(page.getResourcesDictionary().addFormXObjectMapping(secondPageFormId))
                .Q();
            mergedPagesCount++
        }

        page.rotate = (pageIndex % 2 === 0 && 90) || 270;

        bookWriter.writePage(page);

        pageIndex++;
        callback();
    }, function(err) {
        if(err) {
            bookWriter.end();
            return done(err);
        }

        bookWriter.end();
        return done();
    });

    /**
     * @returns page size in pixels
     */
    function getPagesSize(pageIndex) {
        let mediaBox = originalPDFContext.getSourceDocumentParser().parsePage(pageIndex).getMediaBox()

        return {
            x: mediaBox[2],
            y: mediaBox[3]
        };
    }

    /**
     * @param {Number} pageIndex
     * @param {Number} sheetsInPile
     * 
     * @returns Object containing first and second indexes
     */
    function getOriginalIndexes(pageIndex) {
        let pileIndex = parseInt(pageIndex / (sheetsInPile * 2));

        //Index of the page relative to current pile
        let pileRelativeIndex = pageIndex % (sheetsInPile * 2);

        //Index of the first page in the pile
        let groundIndex = pileIndex * sheetsInPile * 4;
        
        var sheetsInCurrentPile = ((groundIndex + sheetsInPile * 4 <= numberOfPages) && sheetsInPile) || Math.ceil((numberOfPages - groundIndex) / 4);

        let first = groundIndex + pileRelativeIndex;
        let second = groundIndex + sheetsInCurrentPile * 4 - pileRelativeIndex - 1;

        //frontside
        if(pageIndex % 2 !== 0) {
            return { 
                firstIndex: first, 
                secondIndex: second 
            };
        }

        //backside
        return { 
            firstIndex: second, 
            secondIndex: first 
        };
    }
}