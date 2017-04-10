$('.breve').click(function() {
    swal('Em breve', 'Essa página/função ainda não está disponível', 'warning');
    return false;
});

$('.form-breve').submit(function() {
    swal('Em breve', 'Essa função ainda não está disponível', 'warning');
    return false;
});

$(document).ready(function () {
    Main.init();
})

Main = {
    init: function () {
        this.issuu();
    },

    issuu: function () {
        var close   = document.getElementById('closeIssuu');
        var loader  = document.getElementById('issuuLoader');
        var last    = document.getElementById('lastEdition');
        //var div = '<div data-cls="Issuu" data-configid="4954280/45423114" style="width:100%; height:500px;" class="issuuembed"></div><script type="text/javascript" src="//e.issuu.com/embed.js" async="true"></script>';
        // var div = '<iframe data-cls="Issuu" style="width:100%; height:500px;" src="//e.issuu.com/embed.html#4954280/45423114" frameborder="0" allowfullscreen></iframe>';
        var div = '<iframe data-cls="Issuu" style="width:100%; height:500px;" src="//e.issuu.com/embed.html#4954280/46912615" frameborder="0" allowfullscreen></iframe>';

        $(loader).hide();

        last.onclick = function () {
            //loader.appendChild(div);
            loader.innerHTML = div;
            $(loader).fadeIn();
            $(close).show();
        };

        close.onclick = function () {
            var _this = this;
            $(loader).fadeOut(function () {
                loader.innerHTML = '';
                $(_this).hide();
            })
        }
    }
};