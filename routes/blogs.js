const express = require("express");
const router = express.Router();
const axios = require("axios");
const lodash = require("lodash");

const getBlogs = async (req, res, next) => {
    const url = 'https://intent-kit-16.hasura.app/api/rest/blogs';
    const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';
    const headers = {
        'x-hasura-admin-secret': adminSecret,
    }
    await axios.get(url, { headers })
        .then((response) => {
            req.blogs = response.data.blogs;
        })
        .catch((error) => {
            console.log(error);
            res.status(404).send("Data not found.");
        })
    return next();
}

const getStats = (data) => {
    const totalBlogs = lodash.size(data);
    const longestTitledBlog = lodash.maxBy(data, (obj) => (obj.title.length))
    const privacyBlogs = lodash.filter(data, (obj) => (lodash.includes(lodash.toLower(obj.title), 'privacy')));
    const privacyBlogsCount = lodash.size(privacyBlogs);
    const uniqueBlogs = lodash.uniqBy(data, (obj) => (obj.title)).map(blog => (blog.title));
    const stats = {
        "Total Blogs": totalBlogs,
        "Longest Titled Blog": longestTitledBlog,
        "Privacy Blogs": privacyBlogsCount,
        "Unique Blogs": uniqueBlogs
    };
    return stats;
}

const getFilteredBlogs = (data, query) => {
    const filteredQuery = lodash.filter(data, (obj) => (lodash.includes(lodash.toLower(obj.title), query)));
    return filteredQuery;
}

router.get("/blog-stats", getBlogs, (req, res) => {
    const data = req.blogs;
    if (!data)
        return res.status(404).json("Stats not available.");
    const memoizedData = lodash.memoize(getStats, (data) => JSON.stringify(data));
    const stats = memoizedData(data);
    return res.status(200).send(stats);
})

router.get('/blog-search', getBlogs, (req, res) => {
    const data = req.blogs;
    const query = req.query.query;
    const memoizedData = lodash.memoize(getFilteredBlogs, (data, query) => JSON.stringify({ data, query }));
    const result = memoizedData(data, query);
    if (!result || !result.length)
        return res.send("No such blog exists.");
    return res.status(200).send(result);
})

module.exports = router;