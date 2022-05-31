// util/spotifyClient.js

//import axios from 'axios';
//import qs from 'qs';

const axios = require("axios").default;
const qs = require('qs');

const fetchSpotifyAccessToken = async () => {
  var clientId = process.env['SPOTIFY_CLIENT_ID']
  var clientSecret = process.env['SPOTIFY_SECRET']

  let auth_token
  if (clientId && clientSecret){
    auth_token = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8').toString('base64');
  }
  
  const headers = {
    headers: {
      'Authorization': `Basic ${auth_token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  //make post request to SPOTIFY API for access token, sending relavent info

  try {
    const token_url = 'https://accounts.spotify.com/api/token'; // move to const
    const grant_type = qs.stringify({ 'grant_type': 'client_credentials' });
    const authRes = await axios.post(token_url, grant_type, headers)
    //return access token
    //console.log('> auth token: ', authRes.data.access_token);   // todo: remove
    if (authRes.status === 200) return authRes.data.access_token

    return null;
    
  } catch (error) {
    //on fail, log the error in console
    console.debug(error?.response?.data);
    
  }
}


const playlistTracks = async ({ playlist_id }) => {
  //request token using spotifyAccessToken() function
  const accessToken = await fetchSpotifyAccessToken();
  if (accessToken === null){
    console.log('>> Add a valid SPOTIFY_CLIENT_ID and SPOTIFY_SECRET in your credentials')
    return null;
  }
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
    //console.log(error);
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
