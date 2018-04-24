var option_std = '<option class="option_std" value="0.7">до 15 секунд</option> \
                  <option class="option_std" value="1" selected="selected">от 16-ти до 30 секунд</option> \
                  <option class="option_std" value="1.2">от 45 секунд</option> \
                  <option class="option_std" value="1.5">от 60 секунд</option> \
                  <option class="option_std" value="2.0">от 120 секунд</option>';
var option_oth = '<option class="option_oth" value="1">до 15 секунд</option> \
                  <option class="option_oth" value="1">от 16-ти до 30 секунд</option> \
                  <option class="option_oth" value="1">от 45 секунд</option> \
                  <option class="option_oth" value="1.5">от 60 секунд</option> \
                  <option class="option_oth" value="2.0">от 120 секунд</option>';

$(function() {
    $("#calculator").on('keyup change', calculate);

    // переключалка для видов медиа
    $("#l_full").click(function(){
        if($("#l_full").is(":checked") == true){
            $("#l_public").attr("disabled", true).attr('checked', false);
            $("#l_internet").attr("disabled", true).attr('checked', false);
        }
        else {
            $("#l_public").removeAttr("disabled");
            $("#l_internet").removeAttr("disabled");
        }
    });

    $("input[name='lic_types[]']").click(function(){
        lic_type = $(this).val();
        if(lic_type == 'std'){
            $("[name='chronometry']").html(option_std);
        }
        else{
            $("[name='chronometry']").html(option_oth);
        }
    });

    $('.numbersOnly').keyup(function () {
        this.value = this.value.replace(/[^0-9\.]/g,'');
        $("input[name='def_rate']").css('border', '1px solid rgb(169, 169, 169)');
    });

    $('.fourNumbersOnly').keyup(function () {
        this.value = this.value.replace(/[^0-9\.]{0:4}/g,'');
    });

});

function plus_countries(){
    $('div#div_countries .plus_countries').last().removeClass('plus_countries').addClass('minus_countries').attr('onclick','minus_countries(this);').text('-');
    var disable_country = $('select.countries:last :selected').attr('cntrid');
    var newdiv = $('select.countries:last').clone();
    $('select.countries:last').prop('disabled', 'disabled');
    newdiv.insertAfter($('div#div_countries .clear').last());
    $('select.countries:last').find("[cntrid='" + disable_country + "']").prop('disabled', 'disabled');
    $('select.countries:last option:enabled:first').attr('selected','selected');
    $('select.countries:last').after("<div class='plus_countries'  onclick='plus_countries();'>+</div><div class='clear'></div>");
    calculate();
};

function minus_countries(el){
    $(el).next().remove();
    var enable_country = $(el).prev().find('option:selected').attr('cntrid');
    $('select.countries:last').find("[cntrid='" + enable_country + "']").removeProp('disabled');
    $(el).prev().remove();
    $(el).remove();
    calculate();
};

function tracks_factor(q){
    switch(q){
        case 1:
            return 1
            break
        case 2:
            return 2
            break
        case 3:
            return 2.5
            break
        default:
            if(q%3 == 0){
                return q/3 + 1.5
            }
            else{
                return parseInt(q/3) + 2
            }
    }
}

function calculate(){
    //базовая ставка
    var def_rate = parseFloat($("input[name='def_rate']").val());

    // количесво лицензируемых роликов с данной музыкой
    var count_tracks = parseFloat($("input[name='count_tracks']").val());

    // общее количество катдаунов
    var cutdowns_free = count_tracks * 2;
    var cutdowns_extra = ($("input[name='cutdowns_extra']").val() != "") ? parseFloat($("input[name='cutdowns_extra']").val()) : 0; // дополнительно
    var price_cutdowns_extra = cutdowns_extra * 5000;

    // виды лицензирования
    var lic_type = $("input[name='lic_types[]']:checked").val();
    var price = 0;
    switch(lic_type){
        case 'unlim':
            price = 299000;
            break;
        case 'full':
            price = 499000;
            break;
        default:
            // виды медиа
            var media = 0;
            $.each($("input[name='lic_media[]']:checked"), function() {
                media +=  parseFloat($(this).val());
            });
            sum_media = media * def_rate;

            // страна лизензирования
            var countries = 0;
            $.each($("select[name='countries[]']"), function() {
                countries +=  parseFloat($(this).val());
            });
            if(countries < 100) countries = 100;
            console.log(countries);
            sum_countries = sum_media * countries/100;

            // коэффициенты в зависимости от количества роликов
            sum_licences = sum_countries * tracks_factor(count_tracks);
            if(sum_licences > 299000) sum_licences = 299000;

            // срок лицензирования
            var time = parseFloat($("select[name='time']").val());
            price = def_rate + sum_licences * time;
    }

    // хронометраж
    var chronometry = parseFloat($("select[name='chronometry']").val());
    sum_chrono = price * chronometry;

    // допрасходы
    var expenses_performer = ($("input[name='expenses_performer']").val() != "") ? parseFloat($("input[name='expenses_performer']").val()) : 0; // учитываем, если не введено значение, то ноль
    var expenses_studio = ($("input[name='expenses_studio']").val() != "") ? parseFloat($("input[name='expenses_studio']").val()) : 0; // учитываем, если не введено значение, то ноль
    sum_expenses = sum_chrono + price_cutdowns_extra + expenses_performer + expenses_studio;

    total = sum_expenses.toFixed(2);

    // заполнение полей
    if(!isNaN(def_rate) && !isNaN(count_tracks) && licences != 0){
        $("input[name='def_rate'], input[name='count_tracks']").css('border', '1px solid rgb(169, 169, 169)');
        $("#licences").css('border', 'none');
        $('#cutdowns_free').val(cutdowns_free);
        $('#cutdowns_total').val(cutdowns_free + cutdowns_extra);
        $("#total").val(total);
    } else {
        if(isNaN(def_rate)){
            $("input[name='def_rate']").css('border','2px solid red');
        }
        if(isNaN(count_tracks)){
            $("input[name='count_tracks']").css('border','2px solid red');
        }
        if(licences == 0){
            $("#licences").css('border','2px solid red');
        }
    }

    $("#licences input").click(function(){
        $(this).parent().css('border', 'none');
    });
}