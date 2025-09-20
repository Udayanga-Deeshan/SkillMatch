import { atom } from 'jotai';

export type JobForCandidate = {
  id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  salary: number | null;
  createdAt: string;
  recruiter: { id: string; name: string } | null;
  _count?: {
    applications: number;
  };
};

export type Application = {
  id: string;
  status: 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  createdAt: string;
  jobId: string;
  job?: {
    id: string;
    title: string;
    location: string;
    recruiter?: {
      name: string;
    };
  };
};

export type CandidateStats = {
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  rejectedApplications: number;
  hiredApplications: number;
  savedJobs: number;
};

export type JobFilters = {
  search: string;
  location: string;
  salaryRange: { min: number | null; max: number | null };
  jobType: string;
  company: string;
  datePosted: 'all' | 'today' | 'week' | 'month';
};

// Base atoms
export const candidateJobsAtom = atom<JobForCandidate[]>([]);
export const candidateApplicationsAtom = atom<Application[]>([]);
export const candidateStatsAtom = atom<CandidateStats>({
  totalApplications: 0,
  pendingApplications: 0,
  shortlistedApplications: 0,
  rejectedApplications: 0,
  hiredApplications: 0,
  savedJobs: 0,
});

export const candidateJobsLoadingAtom = atom<boolean>(false);
export const candidateJobsErrorAtom = atom<string | null>(null);
export const applicationLoadingAtom = atom<string | null>(null); // Job ID currently being applied to
export const applicationErrorAtom = atom<string | null>(null);

// Job filters
export const jobFiltersAtom = atom<JobFilters>({
  search: '',
  location: '',
  salaryRange: { min: null, max: null },
  jobType: '',
  company: '',
  datePosted: 'all',
});

// UI state
export const dashboardViewAtom = atom<'jobs' | 'applications' | 'profile' | 'saved'>('jobs');
export const selectedJobAtom = atom<JobForCandidate | null>(null);
export const jobDetailsModalOpenAtom = atom<boolean>(false);
export const savedJobIdsAtom = atom<string[]>([]);

// Derived atoms
export const appliedJobIdsAtom = atom((get) => {
  const applications = get(candidateApplicationsAtom);
  return applications.map(app => app.jobId);
});

export const filteredJobsAtom = atom((get) => {
  const jobs = get(candidateJobsAtom);
  const filters = get(jobFiltersAtom);
  
  return jobs.filter((job) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.recruiter?.name.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      if (!job.location.toLowerCase().includes(locationLower)) return false;
    }

    // Salary filter
    if (filters.salaryRange.min && job.salary && job.salary < filters.salaryRange.min) return false;
    if (filters.salaryRange.max && job.salary && job.salary > filters.salaryRange.max) return false;

    // Date posted filter
    if (filters.datePosted !== 'all') {
      const jobDate = new Date(job.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - jobDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      switch (filters.datePosted) {
        case 'today':
          if (diffDays > 1) return false;
          break;
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
      }
    }

    return true;
  });
});

export const applicationsByStatusAtom = atom((get) => {
  const applications = get(candidateApplicationsAtom);
  return {
    pending: applications.filter(app => app.status === 'PENDING'),
    shortlisted: applications.filter(app => app.status === 'SHORTLISTED'),
    rejected: applications.filter(app => app.status === 'REJECTED'),
    hired: applications.filter(app => app.status === 'HIRED'),
  };
});

// Action atoms
export const applyToJobAtom = atom(
  null,
  async (get, set, jobId: string) => {
    set(applicationLoadingAtom, jobId);
    set(applicationErrorAtom, null);
    
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply');
      }

      const newApplication = await response.json();
      
      // Update applications list
      const currentApplications = get(candidateApplicationsAtom);
      set(candidateApplicationsAtom, [...currentApplications, newApplication]);
      
      // Update stats
      const currentStats = get(candidateStatsAtom);
      set(candidateStatsAtom, {
        ...currentStats,
        totalApplications: currentStats.totalApplications + 1,
        pendingApplications: currentStats.pendingApplications + 1,
      });
      
    } catch (error) {
      set(applicationErrorAtom, error instanceof Error ? error.message : 'An error occurred');
      throw error;
    } finally {
      set(applicationLoadingAtom, null);
    }
  }
);

export const fetchCandidateDataAtom = atom(
  null,
  async (get, set) => {
    set(candidateJobsLoadingAtom, true);
    set(candidateJobsErrorAtom, null);
    
    try {
      // Fetch jobs and applications in parallel
      const [jobsResponse, applicationsResponse] = await Promise.all([
        fetch('/api/candidate/jobs'),
        fetch('/api/candidate/applications'),
      ]);

      if (!jobsResponse.ok || !applicationsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const jobsData = await jobsResponse.json();
      const applicationsData = await applicationsResponse.json();
      
      set(candidateJobsAtom, jobsData.jobs);
      set(candidateApplicationsAtom, applicationsData.applications);
      set(candidateStatsAtom, applicationsData.stats);
      
    } catch (error) {
      set(candidateJobsErrorAtom, error instanceof Error ? error.message : 'An error occurred');
    } finally {
      set(candidateJobsLoadingAtom, false);
    }
  }
);

export const toggleSaveJobAtom = atom(
  null,
  async (get, set, jobId: string) => {
    const savedJobs = get(savedJobIdsAtom);
    const isSaved = savedJobs.includes(jobId);
    
    try {
      const response = await fetch(`/api/candidate/saved-jobs`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        if (isSaved) {
          set(savedJobIdsAtom, savedJobs.filter(id => id !== jobId));
        } else {
          set(savedJobIdsAtom, [...savedJobs, jobId]);
        }
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
    }
  }
);