const safeQuery = query.replace(/[<>'`]/g, '');
setSearchQuery(safeQuery);