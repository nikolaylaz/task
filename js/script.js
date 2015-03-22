var SORTABLE_TABLE = (function(){

    var tableElem = null,
        currentPage = 1,
        rowsPerPage = 25,
        currentPageElem = null;


    function getData(page) {
        return $.ajax({
            url: "https://api.github.com/repositories?since=" + ((page - 1) *rowsPerPage)
        });
    }

    function bindSortableEvents() {

        var columns = tableElem.find("thead th"),
            sortableCols = tableElem.find("thead .sortable");

        sortableCols.on("click", function(e) {
            var index = columns.index($(this)),
                isDescOrder = $(this).hasClass("desc");


            sortRows(index, isDescOrder ? 1 : -1);

            clearSort(sortableCols);

            if (isDescOrder) {
                $(this).removeClass("desc").addClass("asc");
            } else {
                $(this).removeClass("asc").addClass("desc");
            }
        });
    }

    function clearSort(sortableCols) {

        sortableCols = sortableCols || tableElem.find("thead .sortable");

        sortableCols.removeClass("desc").removeClass("asc");
    }

    function generateRow(tbody, rowData) {

        var tr = $("<tr>");

        tr.append($("<td>", {
            text: rowData.id
        }));

        tr.append($("<td>", {
            text: rowData.name
        }));

        tr.append($("<td>", {
            text: rowData.html_url
        }));

        return tr;
    }

    function bindPaginationEvents() {

        tableElem.find("tfoot .pager a").on("click", function() {
            var direction = $(this).data("action"),
                page = currentPage;

            if (direction == "next-page") {
                page++;
            } else if (direction == "prev-page") {

                if (page - 1 <= 0) {
                    page = 1;
                } else {
                    page--;
                }

            } else {
                page = 1;
            }

            populateTable(page);
        });
    }

    function populateTable(page, onLoaded) {

        if (page === currentPage) {
            return;
        }

        currentPageElem.text(page + " (loading...)");

        getData(page).done(function(data) {
            var i,
                length,
                tbody = tableElem.find("tbody");

            tbody.empty();

            for (i = 0, length = data.length; i < length && i < rowsPerPage; i++) {
                tbody.append(generateRow(tbody, data[i]));
            }

            currentPage = page;
            currentPageElem.text(currentPage);

            clearSort();

            if (typeof onLoaded === "function") {
                onLoaded();
            }
        });
    }

    function sortRows(colNum, order) {
        var rows = tableElem.find("tbody tr"),
            left,
            right,
            tbody = tableElem.find("tbody");;

        rows.sort(function(a, b) {

            left = $(a).find('td').eq(colNum).text().toUpperCase();
            right = $(b).find('td').eq(colNum).text().toUpperCase();

            if(left < right) {
                return -1*order;
            }
            if(left > right) {
                return 1*order;
            }

            return 0;
        });

        tbody.empty();

        rows.each(function(i, row) {
            tbody.append(row);
        });
    }

    return {
        initTable: function(table) {
            if (!table || !table.length) {
                // throw exception
            }

            tableElem = table;
            currentPage = 0;
            currentPageElem = tableElem.find("tfoot [data-current-page]");

            populateTable(1, function() {
                bindSortableEvents();
                bindPaginationEvents();
            });
        }
    }

})();

var RESPONSIVE_MENU = (function() {

    var menuElem = null;

    function bindMenuEffects() {

        var menuElements = menuElem.find("li");

        menuElements.on("click", function() {

            menuElements.removeClass("active");

            $(this).addClass("active");

        });
    }

    return {
        initMenu: function(menu) {
            menuElem = menu;

            bindMenuEffects();
        }
    }
})();

$(function() {
    SORTABLE_TABLE.initTable($("#repositories-data"));

    RESPONSIVE_MENU.initMenu($("nav"));
});