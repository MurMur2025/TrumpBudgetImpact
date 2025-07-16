window.addEventListener('DOMContentLoaded', async () => {
  // 1. Fetch all data
  const [totalsRes, allDistRes, swingDistRes, messagesRes, stateMessagesRes] = await Promise.all([
    fetch('./state_national_republican_swing_totals.json'),
    fetch('./merged_district_data.json'),
    fetch('./merged_district_data_swing.json'),
    fetch('./district_messaging.json'),
    fetch('./state_messaging.json')
  ]);

  const totals = await totalsRes.json();
  const allDistricts = await allDistRes.json();
  const swingDistricts = await swingDistRes.json();
  const districtMessages = await messagesRes.json();
  const stateMessages = await stateMessagesRes.json();

  // 2. DOM refs
  const stateSelect    = document.getElementById('state-select');
  const swingSelect    = document.getElementById('swing-select');
  const districtSelect = document.getElementById('district-select');
  const clearBtn       = document.getElementById('clear-filters');
  const hcEl           = document.getElementById('healthcareTotal');
  const snapEl         = document.getElementById('snapTotal');
  const jobsEl         = document.getElementById('jobsTotal');
  const stateReportEl  = document.getElementById('state-report');
  const distReportEl   = document.getElementById('district-report');

  // 3. Populate selects
  Object.keys(totals.states).sort().forEach(st => {
    const o = document.createElement('option'); o.value = st; o.textContent = st;
    stateSelect.appendChild(o);
  });
  allDistricts.map(d => d.district).sort().forEach(code => {
    const o = document.createElement('option'); o.value = code; o.textContent = code;
    districtSelect.appendChild(o);
  });

  // swing dropdown initial (all swing districts)
  function fillSwing(list) {
    swingSelect.innerHTML = '<option value="">Select Swing District</option>';
    list.sort((a,b) => a.district.localeCompare(b.district)).forEach(d => {
      const o = document.createElement('option'); o.value = d.district; o.textContent = d.district;
      swingSelect.appendChild(o);
    });
  }
  
  // 4. Helpers
  function formatNum(n) {
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(0)+'K';
    return n;
  }
  function updateCounters(src) {
    hcEl.textContent   = formatNum(src.total_medicaid  || 0);
    snapEl.textContent = formatNum(src.snap_households || 0);
    jobsEl.textContent = formatNum(src.jobs_risk       || 0);
  }
  function showState(code) {
    const msg = stateMessages.find(m => m.state === code);
    if (!msg) {
      stateReportEl.innerHTML = `<p>No data for ${code}.</p>`;
      return stateReportEl.style.display = 'block';
    }
    let html = `<h3>${msg.state} Report</h3>`;
    html += `<p><strong>Senators:</strong> ${msg.senators.join(', ')}</p>`;
    html += `<p>${msg.summary}</p>`;
    html += `<h4>Impacts</h4><ul>${msg.national_impacts.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    html += `<h4>Talking Points</h4><ul>${msg.talking_points.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    html += `<h4>Suggested Post</h4><p>${msg.social_post}</p>`;
    stateReportEl.innerHTML = html;
    stateReportEl.style.display = 'block';
  }
  function showDistrict(code) {
    const msg = districtMessages.find(m => m.district === code);
    if (!msg) {
      distReportEl.innerHTML = `<p>No data for ${code}.</p>`;
      return distReportEl.style.display = 'block';
    }
    let html = `<h3>${code} — ${msg.rep_name}</h3>`;
    html += `<p>${msg.output.summary}</p>`;
    html += `<h4>Impacts</h4><ul>${msg.output.national_impacts.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    html += `<h4>Talking Points</h4><ul>${msg.output.talking_points.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    html += `<h4>Suggested Post</h4><p>${msg.output.social_post}</p>`;
    distReportEl.innerHTML = html;
    distReportEl.style.display = 'block';
  }

  // 5. Clear view
  function clearAll() {
    updateCounters(totals.US_totals);
    stateReportEl.style.display = 'none';
    distReportEl.style.display  = 'none';
    stateSelect.value    = '';
    districtSelect.value = '';
    fillSwing(swingDistricts);
  }

  // 6. Listeners
  stateSelect.addEventListener('change', () => {
    const st = stateSelect.value;
    if (!st) return clearAll();
    // state view
    updateCounters(totals.states[st] || {});
    showState(st);
    stateReportEl.scrollIntoView({ behavior: 'smooth' });
    // filter swing by state
    fillSwing(swingDistricts.filter(d => d.district.startsWith(st)));
    districtSelect.value = '';
    distReportEl.style.display = 'none';
  });

  swingSelect.addEventListener('change', () => {
    const code = swingSelect.value;
    if (!code) return clearAll();
    // swing => district view
    const d = swingDistricts.find(x => x.district === code);
    updateCounters({ total_medicaid: d.total_medicaid, snap_households: d.snap_households, jobs_risk: d.jobs_risk });
    showDistrict(code);
    distReportEl.scrollIntoView({ behavior: 'smooth' });
    stateReportEl.style.display = 'none';
    stateSelect.value = '';
    districtSelect.value = '';
  });

  districtSelect.addEventListener('change', () => {
    const code = districtSelect.value;
    if (!code) return clearAll();
    const d = allDistricts.find(x => x.district === code);
    updateCounters({ total_medicaid: d.total_medicaid, snap_households: d.snap_households, jobs_risk: d.jobs_risk });
    showDistrict(code);
    distReportEl.scrollIntoView({ behavior: 'smooth' });
    stateReportEl.style.display = 'none';
    stateSelect.value = '';
    fillSwing(swingDistricts);
  });

  clearBtn.addEventListener('click', clearAll);

  // 7. Init
  clearAll();
});
