const loginBtn = document.getElementById('login-btn');
const tracksList = document.getElementById('tracks-list');
const loadMoreBtn = document.getElementById('load-more-btn');
const currentTrackDiv = document.getElementById('current-track');
const topTrackDiv = document.getElementById('top-track');
const topArtistsSection = document.getElementById('top-artists-section');
const topArtistsChartCtx = document.getElementById('top-artists-chart').getContext('2d');
const summaryStats = document.getElementById('summary-stats');
const totalMinutesSpan = document.querySelector('#total-minutes span');
const mostPlayedSongSpan = document.querySelector('#most-played-song span');
const totalTracksSpan = document.querySelector('#total-tracks span');

loginBtn.addEventListener('click', ()=>{window.location.href='/api/login'});

const hash = window.location.hash;
if(hash.includes('access_token')){
  const params = new URLSearchParams(hash.replace('#','?'));
  const access_token = params.get('access_token');
  if(access_token){
    loginBtn.style.display='none';

    // Currently Playing
    fetch('https://api.spotify.com/v1/me/player/currently-playing',{headers:{'Authorization':'Bearer '+access_token}})
      .then(res=>res.status===204?null:res.json())
      .then(data=>{
        currentTrackDiv.style.display='flex';
        if(data && data.item){
          const t=data.item;
          currentTrackDiv.innerHTML=`<img src="${t.album.images[0].url}" alt="${t.name}"><div><strong>${t.name}</strong><span>${t.artists.map(a=>a.name).join(', ')}</span></div>`;
        }else{
          currentTrackDiv.innerHTML=`<span style="color:#b3b3b3;">Nessun brano in riproduzione</span>`;
        }
      });

    // Top Tracks
    fetch('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50',{headers:{'Authorization':'Bearer '+access_token}})
      .then(res=>res.json())
      .then(data=>{
        if(data.items && data.items.length>0){
          summaryStats.style.display='flex';
          let totalMinutes=0;
          data.items.forEach(t=>totalMinutes+=Math.floor(t.duration_ms/60000));
          totalMinutesSpan.textContent=totalMinutes+" min";
          totalTracksSpan.textContent=data.items.length;
          const topTrack=data.items[0];
          mostPlayedSongSpan.textContent=`${topTrack.name} (${topTrack.artists.map(a=>a.name).join(', ')})`;
          topTrackDiv.style.display='flex';
          topTrackDiv.innerHTML=`<img src="${topTrack.album.images[0].url}" alt="${topTrack.name}"><div><strong>${topTrack.name}</strong><span>${topTrack.artists.map(a=>a.name).join(', ')}</span></div>`;
        }
      });

    // Top Artists
    fetch('https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10',{headers:{'Authorization':'Bearer '+access_token}})
      .then(res=>res.json())
      .then(data=>{
        if(data.items){
          topArtistsSection.style.display='block';
          const artistNames = data.items.map(a=>a.name);
          const artistValues = data.items.map(a=>a.popularity);
          new Chart(topArtistsChartCtx,{
            type:'bar',
            data:{labels:artistNames,datasets:[{label:'Popolarità',data:artistValues,backgroundColor:'#1DB954',borderRadius:10,maxBarThickness:50}]},
            options:{
              indexAxis:'y',
              scales:{x:{beginAtZero:true,ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}},
              plugins:{legend:{display:false}},
              animation:{duration:1200,easing:'easeOutQuart'}
            }
          });
        }
      });

    // Recent Tracks
    let after=null; let allTracks=[]; let displayedCount=0;
    const fetchTracks=()=>{
      let url='https://api.spotify.com/v1/me/player/recently-played?limit=50';
      if(after) url+='&after='+after;
      fetch(url,{headers:{'Authorization':'Bearer '+access_token}})
        .then(res=>res.json())
        .then(data=>{
          if(!data.items || data.items.length===0) return;
          data.items.forEach(i=>allTracks.push(i.track));
          renderTracks();
          after=new Date(data.items[data.items.length-1].played_at).getTime();
          loadMoreBtn.style.display='block';
        });
    };
    const renderTracks=()=>{
      const next=allTracks.slice(displayedCount,displayedCount+10);
      next.forEach((track,i)=>{
        const li=document.createElement('li');
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
}
