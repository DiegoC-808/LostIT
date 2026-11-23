function paginate(list, query) {
    let page = parseInt(query.page);
    let limit = parseInt(query.limit);
    if (!page || page < 1) {
        page = 1;
    }
    if (!limit || limit < 1) {
        limit = 10;
    }
    return {
        page: page,
        limit: limit,
        total: list.length,
        total_pages: Math.ceil(list.length / limit),
        data: list.slice((page - 1) * limit, page * limit)
    };
}

module.exports = paginate;
