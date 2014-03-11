var RoundRobbin = {
    add: function (maxSize, arr, item) {
        arr = (arr || []).filter(function (i) {
            return i.id != item.id;
        }).sort(function (a, b) {
            return a.updated.getTime() - b.updated.getTime();
        });

        if (arr.length >= maxSize) {
            arr = arr.splice(0, arr.length - maxSize);
        }

        arr.push(item);

        return arr;
    },

    get: function (arr, id) {
        arr = arr || [];
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i].id == id) return arr[i];
        }
    }
}