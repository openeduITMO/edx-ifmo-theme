$(document).ready(function(){

    function Cache()
    {
        this.changed = false;
        this.data = {};
        this.indices = [];

        /**
         * Устанавливает элемент в кеше с соответствующим ключом.
         */
        this.set = function (index, value)
        {
            this.data[index] = value;
            this.changed = true;
        };

        /**
         * Сбрасывает состояние изменённости.
         */
        this.reset = function()
        {
            this.changed = false;
            this.indices = [];
        };

        /**
         * Добовляет элемент в кеш.
         */
        this.add = function($element)
        {
            this.set($element.index(), $element);
        };

        /**
         * Помещает в кеш курсы, которые будут скрыты при применении фильтра
         *
         * @param $elems список курсов которые будут отфильтрованы
         * @param attr атрибут курса который будет проверяться при фильтрации
         *        (может быть указан "search" если применяется поиск по курсам)
         * @param attr_value значение атрибута по которому будет проводиться поиск
         */
        this.apply_filter = function ($elems, attr, attr_value)
        {
            var this_cache = this;
            this_cache.reset();
            if(attr == "search"){
                $elems.each(function(){
                    if (!$(this).has(".ifmo-author-data p:containsInsensitive('"+ attr_value +"')").length &&
                        !$(this).has(".course-code:containsInsensitive('"+ attr_value +"')").length &&
                        !$(this).has(".course-title:containsInsensitive('"+ attr_value +"')").length) {

                        this_cache.add($(this).parent());
                    }
                })
            }else{
                $elems.filter(":not(["+attr+"~='"+attr_value+"'])").each(function(){
                    this_cache.add($(this).parent());
                });
            }
        };

        /**
         * Сравнивает соотвествие содержимого кеша по ключам с другим.
         */
        this.equal = function(other) {
            var result = _.intersection(this.indices, other.indices);
            return result == this.indices.length && result == other.indices.length;
        };

        /**
         * Восстанавливает содержимое кеша на странице.
         */
        this.restore = function() {
            var this_cache = this;
            $.each(this_cache.data, function(index, $course){
                index = parseInt(index);
                if(index == 0) {
                    $courses_container.prepend($course);
                } else {
                    var to_add = index + 1;
                    while (this_cache.data[to_add]) to_add += 1;
                    if (to_add == $courses.length) {
                        $courses_container.append($course);
                    } else {
                        // TODO: Красивый селектор
                        // Возможно, есть более изящный способ получить позицию
                        // элемента изначальную позицию элемента, например, с самого
                        // начала записывать в него самого.
                        var course_selector = 'article[id="' + $($courses[to_add]).attr('id') + '"]';
                        $course.insertBefore($courses_container.find(course_selector).parent());
                    }
                }
                delete this_cache.data[index];
            });
        };
    }
    var cache$ = new Cache();

    var $time_filters = $(".time-filters li");
    var $category_filters = $(".category-filters");
    var $courses = $(".course");
    var $courses_container = $('.courses-listing.ifmo-listing');
    var filters = [];

    $courses.parent().slice(6).hide();
    var extra_courses_are_hidden = true;

    //Показывает все курсы, которые были скрыты при загрузке страницы
    function show_extra_courses(){
        if (extra_courses_are_hidden){
            $('.ifmo-catalog-more-courses').hide();
            $courses.parent().show();
            extra_courses_are_hidden = false
        }
    }


    function show_matching_message()
    {
        var $div = $('div#ifmo-total-courses');
        var total_courses = $courses_container.children().length;
        $div.find('.ifmo-total-courses').text(total_courses);
        if (!total_courses){
            $('.ifmo-no-courses-found').show();
        }else{
            $('.ifmo-no-courses-found').hide();
        }
        if(filters.length) {
            $div.find('.ifmo-total-courses-all').hide();
            $div.find('.ifmo-total-courses-matching').show();
        } else {
            $div.find('.ifmo-total-courses-all').show();
            $div.find('.ifmo-total-courses-matching').hide();
        }
    }

    $('.ifmo-catalog-more-courses').click(function(){
        show_extra_courses();
    });


    // Селектор возвращающий элементы содержащие указанный текст, вне зависимости от регистра
    jQuery.expr[':'].containsInsensitive = function(a, i, m) {
      return jQuery(a).text().toUpperCase()
          .indexOf(m[3].toUpperCase()) >= 0;
    };

    /**
     * Удаляет фильтр установленный на любом из елементов group из общего
     * списка текущих фильтров (filters)
     *
     * @param group DOM элементы которые находятся в одной категории
     */
    function delete_group_from_filter(group){
        var new_filter = [];
        for(var i = 0; i<filters.length; i++){
            if (filters[i]["group"] != group){
                new_filter.push(filters[i]);
            }
        }
        filters = new_filter;
    }

    //Применяет ко всем курсам текущие установленные фильтры (filters)
    function apply_filters()
    {
        $courses_container.fadeOut(150).promise().then(function(){

            cache$.restore();

            filters.forEach(function(filter){
                cache$.apply_filter($courses, filter["attr_name"], filter["value"]);
            });

            $.each(cache$.data, function(i, val){
                val.remove();
            });

        }).then(function(){
            show_matching_message();
            $('.courses-listing.ifmo-listing').fadeIn(150);
        });
    }

    /**
     * Устанавливает событие нажатия на один из фильтров
     *
     * @param $elems элементы к которым будет привязано событие
     * @param filter_attr аттрибут курса по которому будет происходить
     *                    фильтрование
     */
    function set_filter_event($elems, filter_attr){
        $elems.click(function(){
            show_extra_courses();
            var attr_value = $(this).attr("filter");
            var filter_element = {"attr_name": filter_attr,
                                  "value": attr_value,
                                  "group": $elems};

            if($(this).hasClass("highlighted")) {
                delete_group_from_filter($elems);
                $elems.removeClass("highlighted");
            }else{
                delete_group_from_filter($elems);
                $elems.removeClass("highlighted");
                filters.push(filter_element);
                $(this).addClass("highlighted");
            }
            apply_filters();
        });
    }

    /**
     * Устанавливает событие изменения $input для реализации поиска по значению
     *
     * @param $input <input> к которому привязывется событие
     */
    function set_search_event($input){
        $input.on('input', function () {
            show_extra_courses();
            var value = $(this).val();
            delete_group_from_filter($input);
            if(value) {
                filters.push({"attr_name": "search",
                              "value": value,
                              "group": $input});
            }
            apply_filters();
        })
    }

    set_search_event($(".ifmo-catalog-search input"));

    set_filter_event($time_filters, "data-ifmo-course-state");
    $category_filters.each(function(){
        set_filter_event($(this).find("li"), "data-ifmo-course-categories");
    });
});