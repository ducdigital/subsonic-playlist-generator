require('dotenv').config();
const {
  SUBSONIC_HOST,
  SUBSONIC_PASS,
  SUBSONIC_TOKEN,
  SUBSONIC_SALT,
  SUBSONIC_USER,
  PORT = 8089,
  HOST = '0.0.0.0',
} = process.env;

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

const server = http.createServer(function(req, res) {
  generatePlaylist().then(m3uPlaylist => {
    res.writeHead(200);
    console.log('Generated Playlist:');
    console.log(m3uPlaylist);
    console.log(`Generated at: ${new Date()}`);
    return res.end(m3uPlaylist);
  })
});

server.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);
});