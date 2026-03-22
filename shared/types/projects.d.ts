export interface ProjectReference {
    id: string;
    name: string;
}
export type ProjectStoryStatus = 'todo' | 'in_progress' | 'done' | 'superseded' | 'unknown';
export interface ProjectBoardItem {
    id: string;
    title: string;
    status: ProjectStoryStatus;
    points: number | null;
}
export interface ProjectBoardColumn {
    id: string;
    title: string;
    items: ProjectBoardItem[];
}
export interface ProjectScrumboard {
    sprintName: string | null;
    goal: string | null;
    columns: ProjectBoardColumn[];
}
export interface ProjectDashboardData {
    project: ProjectReference;
    scrumboard: ProjectScrumboard;
}
export interface ProjectSummaryData {
    project: ProjectReference;
    sprintName: string | null;
    sprintGoal: string | null;
    activeSprintCount: number;
    topStory: {
        id: string;
        title: string;
        status: ProjectStoryStatus;
    } | null;
    latestCommit: {
        shortHash: string;
        subject: string;
    } | null;
}
export interface ProjectStorySummary {
    id: string;
    title: string;
    story: string | null;
    priority: string | null;
    storyPoints: number | null;
    status: ProjectStoryStatus;
    path: string;
}
export interface ProjectStoriesResponse {
    project: ProjectReference;
    stories: ProjectStorySummary[];
}
export interface ProjectGitCommit {
    hash: string;
    shortHash: string;
    subject: string;
    authorName: string;
    committedAt: string;
}
export interface ProjectGitLogResponse {
    project: ProjectReference;
    commits: ProjectGitCommit[];
}
