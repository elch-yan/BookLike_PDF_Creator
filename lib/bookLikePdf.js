const async = require('async');
const hummus = require('hummus');
const path = require('path');

const A4_x = 595;
const A4_y = 842;
const a4_y_half = A4_y / 2;

module.exports = function(filePath, done) {
    var bookWriter = hummus.createWriter(filePath.replace(/\.pdf$/i, '#elch_yan.pdf'));
    var originalPDFContext = bookWriter.createPDFCopyingContext(filePath);

    var numberOfPages = originalPDFContext.getSourceDocumentParser().getPagesCount();
    
    var pageIndex = 0;
    async.whilst(() => pageIndex < numberOfPages / 2, function(callback) {
       let firstIndex, secondIndex;

       //Determining original page indexes
        if(pageIndex % 2 === 0) {
            firstIndex = (pageIndex + 1) * 2 + 1;
            secondIndex = pageIndex * 2;
        } else {
            secondIndex = pageIndex * 2;
            firstIndex = secondIndex - 1;
        }



        //Creating A4 format blank page rotated by 90 degrees
        var page = bookWriter.createPage(0,0,A4_y,A4_x);

        var pageContent = bookWriter.startPageContentContext(page);

        if(firstIndex <= numberOfPages - 1) {
            let pageSize = getPagesSize(firstIndex);
            pageContent.q().cm(a4_y_half/pageSize.x, 0, 0, A4_x/pageSize.y, 0, 0);
            
            //Placing first page
            originalPDFContext.mergePDFPageToPage(page, firstIndex);
        }

        if(secondIndex <= numberOfPages - 1) {
            let pageSize = getPagesSize(secondIndex);
            let secondPageFormId = originalPDFContext.createFormXObjectFromPDFPage(secondIndex, hummus.ePDFPageBoxMediaBox);

            //Placing Second page
            pageContent.Q()
                .q()
                .cm(a4_y_half/pageSize.x, 0, 0, A4_x/pageSize.y, a4_y_half, 0)
                .doXObject(page.getResourcesDictionary().addFormXObjectMapping(secondPageFormId))
                .Q();
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
}