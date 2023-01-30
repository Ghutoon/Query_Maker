let express = require('express');
let axios = require('axios');
let exp = express();
let port = 8080;

exp.use(express.json());
exp.use(express.urlencoded({
    extended: true
}));

require('dotenv').config();
let urlx = `https://api.themoviedb.org/3/search/person?`
let actor_id = {};


exp.post("/", (req, res) => {
    let queries = req.body;

    async function map_actor_with_ID(actor_name) {
        if (actor_id[actor_name] != null) // already mapped
            return;

        try {
            let config = {
                method: 'get',
                url: `https://api.themoviedb.org/3/search/person?api_key=${process.env.THE_MOVIE_DB_KEY}&query=${actor_name}`,
                headers: {}
            };
            const actor_ID_response = await axios(config);
            if (actor_ID_response["total_results"] == 0) { // map with unidentified
                // actor_mapping[actor_name] = ACTOR_NOT_FOUND;
                return null;
            }
            actor_id[actor_name] = actor_ID_response.data.results[0]["id"];
            return;
        } catch (err) {
            console.error(err.message);
            console.log(`Failed to identify ${actor_name}`);
            return;
        }
    }

    let actors = queries["actors"];



    async function fun() {
        for (let i = 0; i < actors.length; i++) {
            const name = actors[i];
            let response = await map_actor_with_ID(name)
        }

        console.log(actor_id)
        urlx = `https://api.themoviedb.org/3/discover/movie?`
        let len = actors.length
        urlx += "&with_people=";
        for (let i = 0; i < len - 1; i++) {
            urlx += `${actor_id[actors[i]]},`;
        }
        urlx += actor_id[actors[len - 1]];

        console.log(urlx);
        var config = {
            method: 'get',
            url: urlx + `&api_key=${process.env.THE_MOVIE_DB_KEY}`,
            headers: {}
        };

        axios(config)
            .then(function (response) {
                res.send(response.data)
                //console.log(response.data);
            })
            .catch(function (error) {
                res.send("error.message")
                //console.log(error);
            });
    }

    fun();
});

exp.listen(port, () => {
    console.log(`Express server started at port ${port}`);
});