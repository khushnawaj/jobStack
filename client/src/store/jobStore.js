import { create } from 'zustand';
import api from '../api/axios';

const useJobStore = create((set) => ({
    jobs: [],
    isLoading: false,
    fetchJobs: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/jobs');
            set({ jobs: res.data, isLoading: false });
        } catch {
            set({ jobs: [], isLoading: false });
        }
    },
    addJob: async (jobData) => {
        const res = await api.post('/jobs', jobData);
        set((state) => ({ jobs: [res.data, ...state.jobs], isLoading: false }));
    },
    updateJob: async (id, updates) => {
        const res = await api.put(`/jobs/${id}`, updates);
        set((state) => ({
            jobs: state.jobs.map((job) => (job.id === id ? res.data : job)),
            isLoading: false
        }));
    },
    deleteJob: async (id) => {
        await api.delete(`/jobs/${id}`);
        set((state) => ({
            jobs: state.jobs.filter((job) => job.id !== id),
            isLoading: false
        }));
    },
}));

export default useJobStore;
