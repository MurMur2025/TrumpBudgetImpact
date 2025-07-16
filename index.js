window.addEventListener('DOMContentLoaded', async () => {
  // 1. Fetch all data sources
  const [totalsRes, districtsRes, messagesRes, stateMessagesRes] = await Promise.all([
    fetch('./state_national_republican_swing_totals.json'),
    fetch('./merged_district_data.json'),
    fetch('./district_messaging.json'),
    fetch('./state_messaging.json')
  ]);

  const totals = await totalsRes.json();
  const districts = await districtsRes.json();
  const districtMessages = await messagesRes.json();
  const stateMessages = await stateMessagesRes.json();

  // 2. Grab DOM elements
  const stateSelect     = document.getElementById('state-select');
  const swingSelect     = document.getElementById('swing-select');
  const districtSelect  = document.getElementById('district-select');
  const clearFiltersBtn = document.getElementById('clear-filters');

  const healthcareTotal = document.getElementById('healthcareTotal');
  const snapTotal       = document.getElementById('snapTotal');
  const jobsTotal       = document.getElementById('jobsTotal');

  const cardsTitle      = document.getElementById('cards-title');
  const cardsContainer  = document.getElementById('cards-container');
  const stateReportEl   = document.getElementById('state-report');
  const districtReportEl= document.getElementById('district-report');

  // 3. Populate State + District dropdowns
  Object.keys(totals.states).sort().forEach(st => {
    const opt = document.createElement('option');
    opt.value = st;
    opt.textContent = st;
    stateSelect.appendChild(opt);
  });
  districts
    .map(d => d.district)
    .sort()
    .forEach(code => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = code;
      districtSelect.appendChild(opt);
    });

  // 4. Initialize swing dropdown (no disabled logic)
  swingSelect.innerHTML = '<option value="">Select Swing District</option>';

  // 5. Helper functions
  function formatNumber(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000)     return (num / 1_000).toFixed(0) + 'K';
    return num;
  }
  function updateCounters(src) {
    healthcareTotal.textContent = formatNumber(src.total_medicaid  || 0);
    snapTotal.textContent       = formatNumber(src.snap_households || 0);
    jobsTotal.textContent       = formatNumber(src.jobs_risk       || 0);
  }
  function renderCards(list) {
    cardsContainer.innerHTML = '';
    if (!list.length) {
      cardsContainer.innerHTML = '<p>No districts found.</p>';
      return;
    }
    list.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${d.district}</h3>
        <button class="toggle-data">Show Data ▼</button>
        <div class="raw-data" style="display:none;">
          <p>Medicaid Cuts: ${formatNumber(d.total_medicaid)}</p>
          <p>SNAP Households: ${formatNumber(d.snap_households)}</p>
          <p>Job Losses: ${formatNumber(d.jobs_risk)}</p>
        </div>`;
      // toggle details
      const btn = card.querySelector('.toggle-data');
      const raw = card.querySelector('.raw-data');
      btn.addEventListener('click', () => {
        const showing = raw.style.display === 'block';
        raw.style.display = showing ? 'none' : 'block';
        btn.textContent   = showing ? 'Show Data ▼' : 'Hide Data ▲';
      });
      cardsContainer.appendChild(card);
    });
  }
  function showStateReport(code) {
    const msg = stateMessages.find(m => m.state === code);
    if (!msg) {
      stateReportEl.innerHTML = `<p>No state report for ${code}.</p>`;
      stateReportEl.style.display = 'block';
      return;
    }
    let html = `<h3>State Report: ${msg.state}</h3>`;
    html += `<p><strong>Senators:</strong> ${msg.senators.join(', ')}</p>`;
    html += `<p>${msg.summary}</p>`;
    html += `<h4>National Impacts</h4><ul>${msg.national_impacts.map(i => `<li>${i}</li>`).join('')}</ul>`;
    html += `<h4>Talking Points</h4><ul>${msg.talking_points.map(i => `<li>${i}</li>`).join('')}</ul>`;
    html += `<h4>Suggested Post</h4><p>${msg.social_post}</p>`;
    stateReportEl.innerHTML = html;
    stateReportEl.style.display = 'block';
  }
  function showDistrictReport(code) {
    const msg = districtMessages.find(m => m.district === code);
    if (!msg) {
      districtReportEl.innerHTML = `<p>No report for ${code}.</p>`;
      districtReportEl.style.display = 'block';
      return;
    }
    let html = `<h3>Report for ${code} — ${msg.rep_name}</h3>`;
    html += `<p>${msg.output.summary}</p>`;
    html += `<h4>National Impacts</h4><ul>${msg.output.national_impacts.map(i => `<li>${i}</li>`).join('')}</ul>`;
    html += `<h4>Talking Points</h4><ul>${msg.output.talking_points.map(i => `<li>${i}</li>`).join('')}</ul>`;
    html += `<h4>Suggested Post</h4><p>${msg.output.social_post}</p>`;
    districtReportEl.innerHTML = html;
    districtReportEl.style.display = 'block';
  }

  // 6. Clear & populate functions (no disabling)
  function applyClear() {
    cardsTitle.textContent         = 'Most Vulnerable Republican Held Districts';
    updateCounters(totals.US_totals);
    renderCards(districts.filter(d => d.is_target_district));
    cardsContainer.style.display   = '';
    stateReportEl.style.display    = 'none';
    districtReportEl.style.display = 'none';
    stateSelect.value              = '';
    swingSelect.innerHTML          = '<option value="">Select Swing District</option>';
    districtSelect.value           = '';
  }
  function populateSwingSelect(stateCode) {
    swingSelect.innerHTML = '<option value="">Select Swing District</option>';
    districts
      .filter(d => d.district.startsWith(stateCode) && d.is_target_district)
      .sort((a,b) => a.district.localeCompare(b.district))
      .forEach(d => {
        const opt = document.createElement('option');
        opt.value   = d.district;
        opt.textContent = d.district;
        swingSelect.appendChild(opt);
      });
    // always enabled
  }

  // 7. Event listeners
  stateSelect.addEventListener('change', () => {
    const st = stateSelect.value;
    stateReportEl.style.display    = 'none';
    districtReportEl.style.display = 'none';
    if (!st) { applyClear(); return; }
    updateCounters(totals.states[st] || {});
    showStateReport(st);
    stateReportEl.scrollIntoView({ behavior: 'smooth' });
    populateSwingSelect(st);
  });

  swingSelect.addEventListener('change', () => {
    const code = swingSelect.value;
    if (code) {
      districtSelect.value = code;
      districtSelect.dispatchEvent(new Event('change'));
    } else {
      stateSelect.dispatchEvent(new Event('change'));
    }
  });

  districtSelect.addEventListener('change', () => {
    const code = districtSelect.value;
    swingSelect.value = '';
    if (!code) { applyClear(); return; }
    const d = districts.find(x => x.district === code);
    updateCounters({ total_medicaid: d.total_medicaid, snap_households: d.snap_households, jobs_risk: d.jobs_risk });
    cardsContainer.style.display   = 'none';
    stateReportEl.style.display    = 'none';
    showDistrictReport(code);
    districtReportEl.scrollIntoView({ behavior: 'smooth' });
  });

  clearFiltersBtn.addEventListener('click', applyClear);

  // 8. Initial load
  applyClear();
});
