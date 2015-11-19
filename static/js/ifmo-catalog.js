$(document).ready(function(){
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
    function show_if_contains_attr($elems, attr, attr_value){
        $elems.filter(":not(["+attr+"~='"+attr_value+"'])").parent().hide();
    }

    //Применяет ко всем курсам текущие установленные фильтры (filters)
    function apply_filters(){
        $courses.parent().show();
        filters.forEach(function(filter){
            show_if_contains_attr($courses, filter["attr_name"], filter["value"]);
        })
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

    var $time_filters = $(".time-filters li");
    var $category_filters = $(".category-filters");
    var $courses = $(".course");
    var filters = [];

    set_filter_event($time_filters, "data-ifmo-course-state");
    $category_filters.each(function(){
        set_filter_event($(this).find("li"), "data-ifmo-course-categories");
    });
});