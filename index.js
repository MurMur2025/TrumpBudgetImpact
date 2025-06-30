window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚩 index.js running');

  // ✅ Fetch all your JSONs
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

  // ✅ DOM elements
  const stateSelect = document.getElementById('state-select');
  const districtSelect = document.getElementById('district-select');
  const filterRepBtn = document.getElementById('filter-republican');
  const filterSwingBtn = document.getElementById('filter-swing');
  const clearFiltersBtn = document.getElementById('clear-filters');

  const healthcareTotal = document.getElementById('healthcare-total');
  const snapTotal = document.getElementById('snap-total');
  const veteransTotal = document.getElementById('veterans-total');

  const cardsTitle = document.getElementById('cards-title');
  const cardsContainer = document.getElementById('cards-container');
  const stateReportEl = document.getElementById('state-report');
  const districtReportEl = document.getElementById('district-report');

  // ✅ Populate dropdowns
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

  // ✅ Update counters
  function updateCounters(src) {
    healthcareTotal.textContent = (src.total_medicaid || 0).toLocaleString();
    snapTotal.textContent = (src.snap_households || 0).toLocaleString();
    veteransTotal.textContent = (src.veteran_population || 0).toLocaleString();
  }

  // ✅ State-level report renderer
  function showStateReport(code) {
    const msg = stateMessages.find(m => m.state === code);
    if (!msg) {
      stateReportEl.innerHTML = `<p>No state report found for ${code}.</p>`;
      stateReportEl.style.display = 'block';
      return;
    }
    let html = `<h3>State Report: ${msg.state}</h3>`;
    html += `<p><strong>Senators:</strong> ${msg.senators.join(', ')}</p>`;
    html += `<p>${msg.summary}</p>`;
    html += `<h4>National Impacts</h4><ul>`;
    msg.national_impacts.forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += `</ul>`;
    html += `<h4>Talking Points</h4><ul>`;
    msg.talking_points.forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += `</ul>`;
    html += `<h4>Suggested Post</h4><p>${msg.social_post}</p>`;

    stateReportEl.innerHTML = html;
    stateReportEl.style.display = 'block';
  }

  // ✅ District-level report with Congressman name
  function showDistrictReport(code) {
    const msg = districtMessages.find(m => m.district === code);
    if (!msg) {
      districtReportEl.innerHTML = `<p>No report for ${code}.</p>`;
      districtReportEl.style.display = 'block';
      return;
    }
    let html = `<h3>Report for ${code} — ${msg.rep_name}</h3>`;
    html += `<p>${msg.output.summary}</p>`;
    html += `<h4>National Impacts</h4><ul>`;
    msg.output.national_impacts.forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += `</ul>`;
    html += `<h4>Talking Points</h4><ul>`;
    msg.output.talking_points.forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += `</ul>`;
    html += `<h4>Suggested Post</h4><p>${msg.output.social_post}</p>`;

    districtReportEl.innerHTML = html;
    districtReportEl.style.display = 'block';
  }

  // ✅ Default swing view
  function applyClear() {
    cardsTitle.textContent = 'Most Vulnerable Republican Held Districts';
    updateCounters(totals.US_totals);
    cardsContainer.style.display = '';
    renderCards(districts.filter(d => d.is_target_district));
    stateReportEl.style.display = 'none';
    districtReportEl.style.display = 'none';
  }

  // ✅ Render default swing cards
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
          <p>Total Medicaid: ${d.total_medicaid.toLocaleString()}</p>
          <p>SNAP Households: ${d.snap_households.toLocaleString()}</p>
          <p>Veterans: ${d.veteran_population.toLocaleString()}</p>
        </div>
      `;
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

  // ✅ All Rep-Held filter
  filterRepBtn.addEventListener('click', () => {
    cardsTitle.textContent = 'Most Vulnerable Republican Held Districts';
    updateCounters(totals.republican_totals);
    cardsContainer.style.display = '';
    renderCards(districts.filter(d => d.Party === 'R'));
    stateReportEl.style.display = 'none';
    districtReportEl.style.display = 'none';
  });

  // ✅ Top swing filter
  filterSwingBtn.addEventListener('click', () => {
    cardsTitle.textContent = 'Most Vulnerable Republican Held Districts';
    updateCounters(totals.swing_totals);
    cardsContainer.style.display = '';
    renderCards(districts.filter(d => d.is_target_district));
    stateReportEl.style.display = 'none';
    districtReportEl.style.display = 'none';
  });

  // ✅ When you pick a STATE: show report & dropdown, and scroll to state report!
  stateSelect.addEventListener('change', () => {
    const st = stateSelect.value;
    if (!st) {
      applyClear();
      return;
    }

    updateCounters(totals.states[st] || {});
    districtReportEl.style.display = 'none';

    // Show state report
    showStateReport(st);
    // ✅ Scroll to state report
    stateReportEl.scrollIntoView({ behavior: 'smooth' });

    const swings = districts.filter(d => d.district.startsWith(st) && d.is_target_district);

    if (swings.length) {
      cardsTitle.textContent = `Swing Districts in ${st}`;
      let selectHTML = `<select id="swing-select"><option value="">Select Swing District</option>`;
      swings.forEach(d => {
        selectHTML += `<option value="${d.district}">${d.district}</option>`;
      });
      selectHTML += `</select>`;

      cardsContainer.innerHTML = selectHTML;

      document.getElementById('swing-select').addEventListener('change', e => {
        const pick = e.target.value;
        if (pick) {
          districtSelect.value = pick;
          districtSelect.dispatchEvent(new Event('change'));
        }
      });

      cardsContainer.style.display = '';
    } else {
      cardsTitle.textContent = `No Swing Districts in ${st}`;
      cardsContainer.innerHTML = '';
      cardsContainer.style.display = '';
    }
  });

  // ✅ When you pick a DISTRICT: show full report + scroll to it!
  districtSelect.addEventListener('change', () => {
    const code = districtSelect.value;
    if (!code) {
      applyClear();
      return;
    }
    cardsTitle.textContent = `Report for ${code}`;
    const d = districts.find(x => x.district === code);
    updateCounters({
      total_medicaid: d.total_medicaid,
      snap_households: d.snap_households,
      veteran_population: d.veteran_population
    });
    cardsContainer.style.display = 'none';
    stateReportEl.style.display = 'none';

    showDistrictReport(code);
    // ✅ Scroll to district report
    districtReportEl.scrollIntoView({ behavior: 'smooth' });
  });

  clearFiltersBtn.addEventListener('click', applyClear);

  applyClear();
});
