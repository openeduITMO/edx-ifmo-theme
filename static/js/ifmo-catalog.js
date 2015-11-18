$(document).ready(function(){
    function delete_from_filter(element){
        var new_filter = [];
        for(var i = 0; i<filters.length; i++){
            if (filters[i]["attr_name"] != element["attr_name"]){
                new_filter.push(filters[i]);
            }
        }
        filters = new_filter;
    }

    function show_only_by_attr($elems, attr, attr_value){
        $elems.filter(":not(["+attr+"='"+attr_value+"'])").hide();
    }

    function apply_filters(){
        $courses.show();
        filters.forEach(function(filter){
            show_only_by_attr($courses, filter["attr_name"], filter["value"]);
        })
    }

    function set_filter_event($elems, filter_attr){
        $elems.click(function(){
            var attr_value = $(this).attr("filter");
            var filter_element = {"attr_name": filter_attr,
                                  "value": attr_value};

            if($(this).hasClass("highlighted")) {
                delete_from_filter(filter_element);
                $(this).removeClass("highlighted");
                $elems.show();
                $courses.show();
            }else{
                filters.push(filter_element);
                $(this).addClass("highlighted");
                $elems.not($(this)).hide();
            }
            apply_filters();
        })
    }

    var $time_filters = $(".time-filters li");
    var $subject_filters = $(".subject-filters li");
    var $courses = $(".course");
    var filters = [];

    set_filter_event($time_filters, "data-ifmo-course-state");
    set_filter_event($subject_filters, "data-ifmo-course-subject");
});