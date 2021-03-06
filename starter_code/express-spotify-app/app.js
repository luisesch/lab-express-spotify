const SpotifyWebApi = require("spotify-web-api-node");
const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "hbs");
app.set("views", __dirname + "/views/layout");
app.use(express.static(__dirname + "/public"));

const clientId = "b97f371b01864066b33b0df9a243e401",
  clientSecret = "d779c60a24274903b956eb6fab9f82f4";

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    spotifyApi.setAccessToken(data.body["access_token"]);
  },
  function(err) {
    console.log("Something went wrong when retrieving an access token", err);
  }
);

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/artists", function(req, res) {
  // res.send(req.body.artist);
  if (req.query.artist !== "") {
    spotifyApi
      .searchArtists(req.query.artist)
      .then(data => {
        // res.send(data);
        let artists = data.body.artists.items.map(artist => {
          return artist;
        });
        res.render("artists", { artists, search: req.query.artist });
      })

      .catch(err => {
        console.log(err);
      });
  } else {
    res.render("index");
  }
});

app.get("/albums/:artistId", (req, res) => {
  // res.send(req.params.artistId);
  spotifyApi
    .getArtistAlbums(req.params.artistId)
    .then(data => {
      // res.send(data.body);
      let albums = data.body.items;
      res.render("albums", { albums });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/tracks/:albumId", (req, res) => {
  // res.send(req.params.artistId);

  var album = "";

  spotifyApi
    .getAlbumTracks(req.params.albumId)
    .then(
      spotifyApi.getAlbum(req.params.albumId).then(data => {
        // res.send(data.body.name);
        album = data.body.name;
      })
    )
    .then(data => {
      //res.send(data.body);
      let tracks = data.body.items;
      console.log(album);
      res.render("tracks", { tracks, album });
    })
    .catch(err => {
      console.log(err);
    });
});

app.listen(3000, () => console.log("Spotify app listening on port 3000!"));
