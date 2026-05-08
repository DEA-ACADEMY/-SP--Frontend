export type DonorDashboardData = {
    supportedStudents: number;
    activeStudents: number;
    completedTasks: number;
    supportedPrograms: number;
    latestUpdates: Array<{
        id: string;
        message: string;
        createdAt: string;
    }>;
    latestReports: Array<{
        id: string;
        title: string;
        createdAt: string;
    }>;
    recentNotifications: Array<{
        id: string;
        title: string;
        body?: string | null;
        createdAt: string;
        isRead: boolean;
    }>;
};

export type DonorStudent = {
    id: string;
    name: string | null;
    code: string;
    branch: string | null;
    program: string | null;
    cohort: string | null;
    generalStatus: string;
    progressSummary: string;
    assignedSupervisorName: string | null;
    totalTasks: number;
    completedTasks: number;
};

export type DonorProgram = {
    id: string;
    name: string;
    branch: string | null;
    cohortCount: number;
    supportedStudentCount: number;
};

export type DonorMessage = {
    id: string;
    senderId: string;
    senderName: string | null;
    senderRole: string;
    message: string;
    createdAt: string;
};
