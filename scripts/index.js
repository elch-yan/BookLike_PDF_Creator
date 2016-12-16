//Binding jQuery to window
(function() {
    window.$ = window.jQuery = require('jquery');
    const bookLike = require('../lib/bookLikePdf.js');

    var path = undefined;
    $(document).ready( function() {
        $('#pdfInput').change(function(ev) {
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
        bookLike(path, (err) => {
            if(err) {
                return alert(err);
            }

            alert('Yooho your file has been converted!');
        });
    });
})();