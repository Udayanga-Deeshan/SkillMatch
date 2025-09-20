import { atom } from 'jotai';

export type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  salary: number | null;
  createdAt: string;
  recruiterId: string;
  _count?: {
    applications: number;
  };
};

export type JobFormData = {
  title: string;
  description: string;
  location: string;
  company: string;
  salary: number | null;
};

export type JobsStats = {
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
  recentJobs: number;
};

// Atoms for job management
export const jobsAtom = atom<Job[]>([]);
export const jobsLoadingAtom = atom<boolean>(false);
export const jobsErrorAtom = atom<string | null>(null);
export const selectedJobAtom = atom<Job | null>(null);
export const jobFormOpenAtom = atom<boolean>(false);
export const jobEditModeAtom = atom<boolean>(false);
export const jobsStatsAtom = atom<JobsStats>({
  totalJobs: 0,
  totalApplications: 0,
  activeJobs: 0,
  recentJobs: 0,
});

// Derived atoms for filtering and searching
export const jobSearchAtom = atom<string>('');
export const jobLocationFilterAtom = atom<string>('');
export const jobSalaryFilterAtom = atom<{ min: number | null; max: number | null }>({
  min: null,
  max: null,
});

export const filteredJobsAtom = atom((get) => {
  const jobs = get(jobsAtom);
  const search = get(jobSearchAtom).toLowerCase();
  const locationFilter = get(jobLocationFilterAtom);
  const salaryFilter = get(jobSalaryFilterAtom);

  return jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(search) ||
      job.description.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search);

    const matchesLocation = !locationFilter || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesSalary = 
      (!salaryFilter.min || (job.salary && job.salary >= salaryFilter.min)) &&
      (!salaryFilter.max || (job.salary && job.salary <= salaryFilter.max));

    return matchesSearch && matchesLocation && matchesSalary;
  });
});

// Actions atoms
export const createJobAtom = atom(
  null,
  async (get, set, jobData: JobFormData) => {
    set(jobsLoadingAtom, true);
    set(jobsErrorAtom, null);
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      const newJob = await response.json();
      const currentJobs = get(jobsAtom);
      set(jobsAtom, [newJob, ...currentJobs]);
      set(jobFormOpenAtom, false);
      
      // Update stats
      const currentStats = get(jobsStatsAtom);
      set(jobsStatsAtom, {
        ...currentStats,
        totalJobs: currentStats.totalJobs + 1,
        activeJobs: currentStats.activeJobs + 1,
        recentJobs: currentStats.recentJobs + 1,
      });
      
    } catch (error) {
      set(jobsErrorAtom, error instanceof Error ? error.message : 'An error occurred');
    } finally {
      set(jobsLoadingAtom, false);
    }
  }
);

export const updateJobAtom = atom(
  null,
  async (get, set, { id, jobData }: { id: string; jobData: JobFormData }) => {
    set(jobsLoadingAtom, true);
    set(jobsErrorAtom, null);
    
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error('Failed to update job');
      }

      const updatedJob = await response.json();
      const currentJobs = get(jobsAtom);
      set(jobsAtom, currentJobs.map(job => job.id === id ? updatedJob : job));
      set(jobFormOpenAtom, false);
      set(jobEditModeAtom, false);
      set(selectedJobAtom, null);
      
    } catch (error) {
      set(jobsErrorAtom, error instanceof Error ? error.message : 'An error occurred');
    } finally {
      set(jobsLoadingAtom, false);
    }
  }
);

export const deleteJobAtom = atom(
  null,
  async (get, set, jobId: string) => {
    set(jobsLoadingAtom, true);
    set(jobsErrorAtom, null);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      const currentJobs = get(jobsAtom);
      const deletedJob = currentJobs.find(job => job.id === jobId);
      set(jobsAtom, currentJobs.filter(job => job.id !== jobId));
      
      // Update stats
      const currentStats = get(jobsStatsAtom);
      set(jobsStatsAtom, {
        ...currentStats,
        totalJobs: currentStats.totalJobs - 1,
        activeJobs: currentStats.activeJobs - 1,
        totalApplications: currentStats.totalApplications - (deletedJob?._count?.applications || 0),
      });
      
    } catch (error) {
      set(jobsErrorAtom, error instanceof Error ? error.message : 'An error occurred');
    } finally {
      set(jobsLoadingAtom, false);
    }
  }
);

export const fetchJobsAtom = atom(
  null,
  async (get, set) => {
    set(jobsLoadingAtom, true);
    set(jobsErrorAtom, null);
    
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      set(jobsAtom, data.jobs);
      set(jobsStatsAtom, data.stats);
      
    } catch (error) {
      set(jobsErrorAtom, error instanceof Error ? error.message : 'An error occurred');
    } finally {
      set(jobsLoadingAtom, false);
    }
  }
);