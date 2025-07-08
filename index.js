// === FINAL INDEX.JS ===

window.addEventListener('DOMContentLoaded', async () => {
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

  const stateSelect = document.getElementById('state-select');
  const districtSelect = document.getElementById('district-select');
  const filterSwingBtn = document.getElementById('filter-swing');
  const clearFiltersBtn = document.getElementById('clear-filters');

  const healthcareTotal = document.getElementById('healthcareTotal');
  const snapTotal = document.getElementById('snapTotal');
  const jobsTotal = document.getElementById('jobsTotal');

  const cardsTitle = document.getElementById('cards-title');
  const cardsContainer = document.getElementById('cards-container');
  const stateReportEl = document.getElementById('state-report');
  const districtReportEl = document.getElementById('district-report');

  Object.keys(totals.states).sort().forEach(st => {
    const opt = document.createElement('option');
    opt.value = st;
    opt.textContent = st;
    stateSelect.appendChild(opt);
  });

  districts.map(d => d.district).sort().forEach(code => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = code;
    districtSelect.appendChild(opt);
  });

  function updateCounters(src) {
    healthcareTotal.textContent = formatNumber(src.total_medicaid || 0);
    snapTotal.textContent = formatNumber(src.snap_households || 0);
    jobsTotal.textContent = formatNumber(src.jobs_risk || 0);
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num;
  }

  function applyClear() {
    cardsTitle.textContent = 'Most Vulnerable Republican Held Districts';
    updateCounters(totals.US_totals);
    cardsContainer.style.display = '';
    renderCards(districts.filter(d => d.is_target_district));
    stateReportEl.style.display = 'none';
    districtReportEl.style.display = 'none';
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
      card.innerHTML = `<h3>${d.district}</h3>
        <button class="toggle-data">Show Data ▼</button>
        <div class="raw-data" style="display:none;">
          <p>Medicaid: ${d.total_medicaid.toLocaleString()}</p>
          <p>SNAP: ${d.snap_households.toLocaleString()}</p>
          <p>Jobs Lost: ${d.jobs_risk.toLocaleString()}</p>
        </div>`;
      const toggleBtn = card.querySelector('.toggle-data');
      const raw = card.querySelector('.raw-data');
      toggleBtn.addEventListener('click', () => {
        const show = raw.style.display === 'none';
        raw.style.display = show ? 'block' : 'none';
        toggleBtn.textContent = show ? 'Hide Data ▲' : 'Show Data ▼';
      });
      cardsContainer.appendChild(card);
    });
  }

  filterSwingBtn.addEventListener('click', () => {
    cardsTitle.textContent = 'Swing GOP Held Districts';
    updateCounters(totals.swing_totals);
    renderCards(districts.filter(d => d.is_target_district));
    stateReportEl.style.display = 'none';
    districtReportEl.style.display = 'none';
  });

  stateSelect.addEventListener('change', () => {
    const st = stateSelect.value;
    if (!st) return applyClear();
    updateCounters(totals.states[st] || {});
    districtReportEl.style.display = 'none';
    showStateReport(st);
    stateReportEl.scrollIntoView({ behavior: 'smooth' });
  });

  districtSelect.addEventListener('change', () => {
    const code = districtSelect.value;
    if (!code) return applyClear();
    const d = districts.find(x => x.district === code);
    updateCounters({
      total_medicaid: d.total_medicaid,
      snap_households: d.snap_households,
      jobs_risk: d.jobs_risk
    });
    stateReportEl.style.display = 'none';
    showDistrictReport(code);
    districtReportEl.scrollIntoView({ behavior: 'smooth' });
  });

  clearFiltersBtn.addEventListener('click', applyClear);
  applyClear();

  function showStateReport(code) {
    const msg = stateMessages.find(m => m.state === code);
    if (!msg) {
      stateReportEl.innerHTML = `<p>No state report found for ${code}.</p>`;
      stateReportEl.style.display = 'block';
      return;
    }
    let html = `<h3>State Report: ${msg.state}</h3><p><strong>Senators:</strong> ${msg.senators.join(', ')}</p><p>${msg.summary}</p><h4>National Impacts</h4><ul>`;
    msg.national_impacts.forEach(item => html += `<li>${item}</li>`);
    html += `</ul><h4>Talking Points</h4><ul>`;
    msg.talking_points.forEach(item => html += `<li>${item}</li>`);
    html += `</ul><h4>Suggested Post</h4><p>${msg.social_post}</p>`;
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
    let html = `<h3>Report for ${code} — ${msg.rep_name}</h3><p>${msg.output.summary}</p><h4>National Impacts</h4><ul>`;
    msg.output.national_impacts.forEach(item => html += `<li>${item}</li>`);
    html += `</ul><h4>Talking Points</h4><ul>`;
    msg.output.talking_points.forEach(item => html += `<li>${item}</li>`);
    html += `</ul><h4>Suggested Post</h4><p>${msg.output.social_post}</p>`;
    districtReportEl.innerHTML = html;
    districtReportEl.style.display = 'block';
  }
});