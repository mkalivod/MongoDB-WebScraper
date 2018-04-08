
// Madison Kalivoda | MongoDB-WebScraper
/*

$(document).on("click", "#scrape", function () {
    window.location.replace("/scrape");

});
$(document).ready(function () {

    // Event handler to delete a note 
    $('.delete-note-button').on('click', function () {

        // Contains _id of note to delete
        var noteId = $(this).data('id');

        // URL root
        var baseURL = window.location.origin;

        //AJAX Call to delete Note
        $.ajax({
            url: baseURL + '/remove/note/' + noteId,
            type: 'POST'
        })
            .done(function () {
                location.reload(); // Refresh the window after call is done
            });

        // Prevent default
        return false;
    });
});*/