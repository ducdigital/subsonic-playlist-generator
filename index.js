require('dotenv').config();
const {
  SUBSONIC_HOST,
  SUBSONIC_PASS,
  SUBSONIC_TOKEN,
  SUBSONIC_SALT,
  SUBSONIC_USER,
} = process.env;

const url = require('url');
const m3u = require('m3u')
const subsonic = require("subsonicjs")(SUBSONIC_USER, SUBSONIC_TOKEN, SUBSONIC_SALT, SUBSONIC_HOST, SUBSONIC_PASS);
const http = require('http');

async function generatePlaylist () {
  const m3uWriter = m3u.extendedWriter();
  const resp = await subsonic.browsing.getRandomSongs();
  const songs = resp.randomSongs.song;

  songs.forEach(song => {
    const streamUrl = subsonic.media.stream(song.id);
    m3uWriter.file(streamUrl, `${song.artist} - ${song.title}`)
  })

  return m3uWriter.toString();
}

function generateLog(m3uPlaylist) {
  console.log('Generated Playlist:');
  console.log(m3uPlaylist);
  console.log(`Generated at: ${new Date()}`);
}

async function getPlaylistById (id) {
  const m3uWriter = m3u.extendedWriter();
  const resp = await subsonic.playlists.getPlaylist(id);
  const songs = resp.playlist.entry;

  songs.forEach(song => {
    const streamUrl = subsonic.media.stream(song.id);
    m3uWriter.file(streamUrl, `${song.artist} - ${song.title}`)
  })

  return m3uWriter.toString();
}

const server = http.createServer(function(req, res) {
  const query = url.parse(req.url,true).query;

  if (query.playlistId) {
    return getPlaylistById(query.playlistId).then(m3uPlaylist => {
      res.writeHead(200,{
        'Content-Type': 'application/x-mpegURL; charset=utf-8'
      });
      generateLog(m3uPlaylist);
      return res.end(m3uPlaylist);
    })
  }

  return generatePlaylist().then(m3uPlaylist => {
    res.writeHead(200,{
      'Content-Type': 'application/x-mpegURL; charset=utf-8'
    });
    generateLog(m3uPlaylist);
    return res.end(m3uPlaylist);
  })
});

server.listen(process.env.APP_PORT || 80, '0.0.0.0', () => {
  console.log(`Server started on http://0.0.0.0:80`);
});