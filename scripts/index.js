//Binding jQuery to window
(function() {
    window.$ = window.jQuery = require('jquery');
    const bookLike = require('../lib/bookLikePdf.js');

    var path = undefined;
    var sheetsInPile = 1;

    $(document).ready( function() {
        var slctSheetsInPile = $('#slctSheetsInPile');
        
        for(let i = 1; i < 12; i++) {
            slctSheetsInPile.append($("<option></option>")
                    .attr("value", i)
                    .text(i));
        }

        slctSheetsInPile.on('change', function() {
            sheetsInPile = parseInt($(this).val());
        });
        
        $('#pdfInput').on('change', function(ev) {
            path = ev.target.files[0].path;
            
            if((/\.(pdf)$/i).test(path)) {
                $('#fileNameInput').val(path);
                $('#btnConvert').prop('disabled', false);
            } else {
                alert("File format must be pdf");
            }
        });
    });

    $('#btnConvert').on('click', function() {
        bookLike(path, sheetsInPile, (err) => {
            if(err) {
                return alert(err);
            }

            alert('Yooho your file has been converted!');
        });
    });
})();