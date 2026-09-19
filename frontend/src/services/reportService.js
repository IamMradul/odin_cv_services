import { MOCK_REPORTS } from '../data/mockData';

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms));

let _reports = [...MOCK_REPORTS];
let _counter = _reports.length;

export const reportService = {
  async getAll() {
    await delay();
    return [..._reports];
  },

  async getById(id) {
    await delay(300);
    return _reports.find(r => r.id === id) || null;
  },

  async createDraft(data) {
    await delay(400);
    _counter++;
    const newReport = {
      id: `REP-2026-0${90 + _counter}`,
      title: data.title,
      type: data.type,
      date: new Date().toISOString().split('T')[0],
      author: 'Operator 1',
      status: 'Draft',
      attachedAlerts: data.attachedAlerts || [],
      attachedClips: data.attachedClips || [],
      notes: data.notes || '',
    };
    _reports = [newReport, ..._reports];
    return newReport;
  },

  async generate(id) {
    await delay(300);
    // Transition: Draft → Queued → Generating → Ready
    _reports = _reports.map(r => r.id === id ? { ...r, status: 'Queued' } : r);
    setTimeout(() => {
      _reports = _reports.map(r => r.id === id ? { ...r, status: 'Generating' } : r);
    }, 1000);
    setTimeout(() => {
      _reports = _reports.map(r => r.id === id ? { ...r, status: 'Ready' } : r);
    }, 4000);
    return _reports.find(r => r.id === id);
  },

  getReports() {
    return _reports;
  },
};
