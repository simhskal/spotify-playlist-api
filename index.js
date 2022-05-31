// util/spotifyClient.js

//import axios from 'axios';
//import qs from 'qs';

const axios = require("axios").default;
const qs = require('qs');

const fetchSpotifyAccessToken = async () => {
  var client_id = process.env['SPOTIFY_CLIENT_ID']
  var client_secret = process.env['SPOTIFY_SECRET']
 
  console.log(process.env.REPLIT_DB_URL,'\n')
  
  const auth_token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');
  const grant_type = qs.stringify({ 'grant_type': 'client_credentials' });
  const headers = {
    headers: {
      'Authorization': `Basic ${auth_token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  //make post request to SPOTIFY API for access token, sending relavent info

  try {
    const token_url = 'https://accounts.spotify.com/api/token'; // move to const
    const authRes = await axios.post(token_url, grant_type, headers)
    //return access token
    //console.log('> auth token: ', authRes.data.access_token);   // todo: remove
    return authRes.data.access_token;
  } catch (error) {
    //on fail, log the error in console
    console.log(error);
  }
}


const playlistTracks = async ({ playlist_id }) => {
  //request token using spotifyAccessToken() function
  const accessToken = await fetchSpotifyAccessToken();
  //console.log('playlist_id: ', playlist_id);
  const playlist_info_url = `https://api.spotify.com/v1/playlists/${playlist_id}`;
  //console.log('playlist name - ', playlist_info_url);
  try {
    const playlistResponse = await axios.get(playlist_info_url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    //console.log(playlistResponse.data);

    if (playlistResponse.status === 200) {
      //const tracks_from_playlist_url = playlistResponse.data.tracks.href
      return mapToTrackDetailsOnly(playlistResponse.data.tracks.items)
    }
    return [];
  } catch (error) {
    console.log(error);
  }
};

const mapToTrackDetailsOnly = (tracks) => {
  const mappedTracks = tracks.map(function(item) {
    let track = item.track
    return {
      album: track?.album?.name || '',
      track: track.name
    }
  })
  console.log('> list of tracks: ' , mappedTracks)
  return mappedTracks
}

// driver function
console.log(playlistTracks({ playlist_id: process.env['PLAYLIST_ID'] }));
