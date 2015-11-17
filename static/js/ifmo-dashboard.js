/*
    Переключение между вкладками в курсе.
 */

/**
 * Переключает dashboard в соответсвтующее состояние. При этом прячутся все
 * курсы из других состояний.
 *
 * @param new_state
 */
function switch_state(new_state)
{
    // Делаем активным нужный таб
    $('span.ifmo-tab a').removeClass('active');
    $('span[data-ifmo-new-state=' + new_state + '] a').addClass('active');

    // Прячем все курсы
    $('li.course-item:visible').animate(
        {'opacity': 0, 'duration': 150},
        function () {
            $(this).css('display', 'none');
        }

    // По завершении показываем нужные курсы
    ).promise().then(function () {

            // Делаем это только в том случае, если текущий таб всё ещё
            // активен, так как пользователь мог переключить его, пока шла
            // анимация прятания.
            if (!$('span[data-ifmo-new-state=' + new_state + '] a').hasClass('active'))
                return undefined;

            // Показываем анимацию показывания курсов
            return $('li.course-item[data-ifmo-course-state=' + new_state + ']')
                .css('opacity', 0)
                .css('display', 'block')
                .animate({'opacity': 1, 'duration': 150}).promise();
        });
}

// Инициализация
$(function () {

    // Клик по табу инициирует переключение видимости курсов
    $('span.ifmo-tab').hide().click(function (e) {

        // Только в случае, если таб ещё не активен
        if (!$(e.currentTarget).find('a').hasClass('active')) {
            switch_state($(e.currentTarget).data('ifmo-new-state'));
        }
    });

    // Начальная инициализация счётчиков: грядущие курсы, текущие и прошедшие
    var upcoming_courses = $('li[data-ifmo-course-state=upcoming]').length;
    var current_courses = $('li[data-ifmo-course-state=current]').length;
    var archived_courses = $('li[data-ifmo-course-state=archived]').length;

    // Показываем табы в соответствии со счётчиками
    if (upcoming_courses > 0) $('span[data-ifmo-new-state=upcoming]').css('display', 'inline-block');
    if (current_courses > 0) $('span[data-ifmo-new-state=current]').css('display', 'inline-block');
    if (archived_courses > 0) $('span[data-ifmo-new-state=archived]').css('display', 'inline-block');

    // Устанавливаем выбранный таб при наличии курсов. Приоритет: текущие,
    // грядущие, прошедшие
    var selected_tab = 'none';
    if (current_courses > 0) {
        selected_tab = 'current';
    } else if (upcoming_courses > 0) {
        selected_tab = 'upcoming';
    } else if (archived_courses > 0) {
        selected_tab = 'archived';
    }

    // Показываем курсы выбранного таба
    switch_state(selected_tab);
});