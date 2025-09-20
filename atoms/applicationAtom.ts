import { atom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

// Types
export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

export interface Application {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    location: string;
  };
}

export interface ApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  rejectedApplications: number;
  hiredApplications: number;
}

// Base atoms
export const applicationsAtom = atomWithReset<Application[]>([]);
export const applicationStatsAtom = atomWithReset<ApplicationStats>({
  totalApplications: 0,
  pendingApplications: 0,
  shortlistedApplications: 0,
  rejectedApplications: 0,
  hiredApplications: 0,
});

export const applicationsLoadingAtom = atom<boolean>(false);
export const applicationsErrorAtom = atom<string | null>(null);

// Derived atoms
export const filteredApplicationsAtom = atom<Application[]>((get) => {
  const applications = get(applicationsAtom);
  return applications;
});

// Refresh trigger atom
export const refreshApplicationsAtom = atom<number>(0);

// Action atoms
export const fetchApplicationsAtom = atom(
  null,
  async (get, set) => {
    set(applicationsLoadingAtom, true);
    set(applicationsErrorAtom, null);
    
    try {
      const response = await fetch('/api/recruiter/applications', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      set(applicationsAtom, data.applications);
      set(applicationStatsAtom, data.stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      set(applicationsErrorAtom, errorMessage);
    } finally {
      set(applicationsLoadingAtom, false);
    }
  }
);

export const updateApplicationStatusAtom = atom(
  null,
  async (get, set, { applicationId, status }: { applicationId: string; status: ApplicationStatus }) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Trigger refresh by incrementing the refresh counter
      const currentRefresh = get(refreshApplicationsAtom);
      set(refreshApplicationsAtom, currentRefresh + 1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      set(applicationsErrorAtom, errorMessage);
      throw error;
    }
  }
);

// Filter atoms
export const applicationStatusFilterAtom = atom<string>('ALL');
export const applicationSearchTermAtom = atom<string>('');

// Computed filtered applications
export const computedFilteredApplicationsAtom = atom<Application[]>((get) => {
  const applications = get(applicationsAtom);
  const statusFilter = get(applicationStatusFilterAtom);
  const searchTerm = get(applicationSearchTermAtom);
  
  return applications.filter(app => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesSearch = 
      app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
});