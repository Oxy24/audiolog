const loginBtn = document.getElementById('login-btn');
loginBtn.addEventListener('click', ()=>window.location.href='/api/login');

const hash = window.location.hash;
if(hash.includes('access_token')){
  const params = new URLSearchParams(hash.replace('#','?'));
  const access_token = params.get('access_token');
  document.querySelector('.pre-login').style.display='none';
  document.querySelector('main').style.display='block';

  // Currently Playing
  fetch('https://api.spotify.com/v1/me/player/currently-playing',{
    headers:{'Authorization':'Bearer '+access_token}
  }).then(r=>r.status===204?null:r.json())
    .then(data=>{
      const currentTrackDiv = document.getElementById('current-track');
      currentTrackDiv.style.display='flex';
      if(data && data.item){
        const t=data.item;
        currentTrackDiv.innerHTML=`<img src="${t.album.images[0].url}" alt="${t.name}"><div><strong>${t.name}</strong><span>${t.artists.map(a=>a.name).join(', ')}</span></div>`;
      } else {
        currentTrackDiv.innerHTML=`<span style="color:#b3b3b3;">Nessun brano in riproduzione</span>`;
      }
    });

  // Top Tracks Annuali
  fetch('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50',{
    headers:{'Authorization':'Bearer '+access_token}
  }).then(res=>res.json())
    .then(data=>{
      if(!data.items) return;
      let totalMinutes = data.items.reduce((sum,t)=>sum+t.duration_ms/60000,0);
      document.querySelector('#total-minutes span').textContent = Math.floor(totalMinutes)+' min';

      const mostPlayedTrack = data.items[0];
      document.querySelector('#most-played-song span').textContent = `${mostPlayedTrack.name} (${mostPlayedTrack.artists.map(a=>a.name).join(', ')})`;
      document.querySelector('#total-tracks span').textContent = data.items.length;

      const topTrackDiv = document.getElementById('top-track');
      topTrackDiv.style.display='flex';
      topTrackDiv.innerHTML = `<img src="${mostPlayedTrack.album.images[0].url}" alt="${mostPlayedTrack.name}"><div><strong>${mostPlayedTrack.name}</strong><span>${mostPlayedTrack.artists.map(a=>a.name).join(', ')}</span></div>`;
      document.getElementById('summary-stats').style.display='flex';
    });

  // Top Artists Annuali con foto
  fetch('https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10',{
    headers:{'Authorization':'Bearer '+access_token}
  }).then(res=>res.json())
  .then(data=>{
    if(!data.items) return;
    const section = document.getElementById('top-artists-section');
    section.style.display='block';
    section.innerHTML='<h2>Top 10 Artisti</h2><div class="artists-list"></div>';
    const container = section.querySelector('.artists-list');
    
    data.items.forEach((artist,i)=>{
      const div = document.createElement('div');
      div.classList.add('artist-item');
      div.style.flex='0 0 100px';
      div.style.textAlign='center';
      div.style.opacity='0';
      div.style.animation=`fadeInUp 0.4s forwards`;
      div.style.animationDelay=`${i*0.05}s`;
      div.innerHTML = `<img src="${artist.images[0]?.url||artist.images[1]?.url}" alt="${artist.name}"><p>${artist.name}</p>`;
      container.appendChild(div);
    });
  });

  // Recent Tracks (paginated)
  const tracksList = document.getElementById('tracks-list');
  const loadMoreBtn = document.getElementById('load-more-btn');
  let after = null, allTracks=[], displayedCount=0;

  const fetchTracks = ()=>{
    let url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
    if(after) url+='&after='+after;
    fetch(url,{headers:{'Authorization':'Bearer '+access_token}})
      .then(res=>res.json())
      .then(data=>{
        if(!data.items) return;
        data.items.forEach(i=>allTracks.push(i.track));
        renderTracks();
        after=new Date(data.items[data.items.length-1].played_at).getTime();
        loadMoreBtn.style.display='block';
      });
  };

  const renderTracks = ()=>{
    const next = allTracks.slice(displayedCount,displayedCount+10);
    next.forEach((track,i)=>{
      const li = document.createElement('li');
      li.classList.add('track-item');
      li.style.animationDelay = `${i*0.05}s`;
      li.innerHTML=`<img src="${track.album.images[2]?.url||track.album.images[0].url}" alt="${track.name}"><div><div class="track-title">${track.name}</div><div class="track-artist">${track.artists.map(a=>a.name).join(', ')}</div></div>`;
      tracksList.appendChild(li);
    });
    displayedCount+=next.length;
    if(displayedCount>=allTracks.length) loadMoreBtn.style.display='none';
  };
  loadMoreBtn.addEventListener('click',renderTracks);
  fetchTracks();
}
