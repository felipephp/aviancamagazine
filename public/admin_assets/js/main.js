$('.anchor-confirm').click(function (ev) {

    ev.preventDefault();

    var self = this;

    var title = $(self).attr('data-title') || "Mensagem";
    var message = $(self).attr('data-message') || "Tem certeza disso?";

    var yes_label = $(self).attr('data-yes-label') || "Sim";
    var cancel_label = $(self).attr('data-cancel-label') || "Cancelar";

    swal({
        title: title,
        text: message,
        type: "warning",
        confirmButtonColor: "#DD6B55",
        confirmButtonText: yes_label,
        cancelButtonText: cancel_label,
        showCancelButton: true,
        closeOnConfirm: true,
        closeOnCancel: true
    }, function () {
        location.href = $(self).attr('href');
    });

});
