$(document).ready(function(){

    var cache = {};

    var $time_filters = $(".time-filters li");
    var $category_filters = $(".category-filters");
    var $courses = $(".course");
    var $courses_container = $('.courses-listing.ifmo-listing');
    var filters = [];

    //Удаляет фильтр установленный на любом из елементов group из общего списка текущих фильтров (filters)
    function delete_group_from_filter(group){
        var new_filter = [];
        for(var i = 0; i<filters.length; i++){
            if (filters[i]["group"] != group){
                new_filter.push(filters[i]);
            }
        }
        filters = new_filter;
    }

    //Оставляет видными только те элементы, у которых в аттрибуте attr присутствует значение attr_value
    function cache_courses($elems, attr, attr_value){
        $elems.filter(":not(["+attr+"~='"+attr_value+"'])").each(function(){
            var $parent = $(this).parent();
            cache[$parent.index()] = $parent;
        });
    }

    //Применяет ко всем курсам текущие установленные фильтры (filters)
    function apply_filters(){
        $.each(cache, function(index, $course){
            index = parseInt(index);
            if(index == 0) {
                $courses_container.prepend($course);
            } else {
                var to_add = index + 1;
                while (cache[to_add]) to_add += 1;
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
            delete cache[index];
        });
        filters.forEach(function(filter){
            cache_courses($courses, filter["attr_name"], filter["value"]);
        });
        $.each(cache, function(i, val){
            val.remove();
        });
    }

    //Устанавливает событие нажатия на один из фильтров и добавляет фильтр в общий список filters
    function set_filter_event($elems, filter_attr){
        $elems.click(function(){
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
        })
    }

    set_filter_event($time_filters, "data-ifmo-course-state");
    $category_filters.each(function(){
        set_filter_event($(this).find("li"), "data-ifmo-course-categories");
    });
});