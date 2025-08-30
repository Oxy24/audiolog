const loginBtn = document.getElementById('login-btn');
const mainContent = document.querySelector('main');
loginBtn.addEventListener('click', ()=>{window.location.href='/api/login'});

const hash = window.location.hash;
if(hash.includes('access_token')){
  const params = new URLSearchParams(hash.replace('#','?'));
  const access_token = params.get('access_token');
  if(access_token){
    document.querySelector('.pre-login').style.display='none';
    mainContent.style.display='block';

    // Currently Playing
    fetch('https://api.spotify.com/v1/me/player/currently-playing',{headers:{'Authorization':'Bearer '+access_token}})
    .then(res=>res.status===204?null:res.json())
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

    // Top Tracks annuali
    fetch('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50',{
      headers:{'Authorization':'Bearer '+access_token}
    }).then(res=>res.json()).then(data=>{
      if(!data.items || data.items.length===0) return;
      let totalMinutes=0;
      data.items.forEach(t=>totalMinutes+=t.duration_ms/60000);

      const mostPlayedTrack = data.items[0];
      document.querySelector('#most-played-song span').textContent = `${mostPlayedTrack.name} (${mostPlayedTrack.artists.map(a=>a.name).join(', ')})`;
      document.querySelector('#total-minutes span').textContent = Math.floor(totalMinutes)+' min';
      document.querySelector('#total-tracks span').textContent = data.items.length;

      const topTrackDiv = document.getElementById('top-track');
      topTrackDiv.style.display='flex';
      topTrackDiv.innerHTML = `<img src="${mostPlayedTrack.album.images[0].url}" alt="${mostPlayedTrack.name}"><div><strong>${mostPlayedTrack.name}</strong><span>${mostPlayedTrack.artists.map(a=>a.name).join(', ')}</span></div>`;
      document.getElementById('summary-stats').style.display='flex';
    });

    // Top Artists annuali
    fetch('https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10',{
      headers:{'Authorization':'Bearer '+access_token}
    }).then(res=>res.json()).then(data=>{
      if(!data.items || data.items.length===0) return;
      const labels = data.items.map(a=>a.name);
      const values = data.items.map(a=>a.popularity);
      document.getElementById('top-artists-section').style.display='block';
      const ctx = document.getElementById('top-artists-chart').getContext('2d');
      new Chart(ctx,{
        type:'bar',
        data:{labels:labels,datasets:[{label:'Ascolti',data:values,backgroundColor:'#1DB954',borderRadius:10,maxBarThickness:50}]},
        options:{indexAxis:'y',scales:{x:{beginAtZero:true,ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}},plugins:{legend:{display:false}},animation:{duration:1200,easing:'easeOutQuart'}}
      });
    });

    // Recent Tracks
    let after=null; let allTracks=[]; let displayedCount=0;
    const tracksList = document.getElementById('tracks-list');
    const loadMoreBtn = document.getElementById('load-more-btn');

    const fetchTracks=()=>{
      let url='https://api.spotify.com/v1/me/player/recently-played?limit=50';
      if(after) url+='&after='+after;
      fetch(url,{headers:{'Authorization':'Bearer '+access_token}})
      .then(res=>res.json()).then(data=>{
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
