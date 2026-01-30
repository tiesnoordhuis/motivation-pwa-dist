import { GoalService } from '../services/goal.service.js';
export class GoalRenderer {
    goalList;
    goalHeader;
    loadingIndicator;
    errorMessage;
    createBtn;
    goalDialog;
    goalForm;
    confirmDialog;
    statusDialog;
    activeGoalForStatus = null;
    pendingDeleteId = null;
    // Navigation State
    currentParentId = null;
    allGoals = [];
    constructor() {
        this.goalList = document.getElementById('goals-list');
        this.goalHeader = document.getElementById('goal-header');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.errorMessage = document.getElementById('error-message');
        this.createBtn = document.getElementById('create-goal-btn');
        this.goalDialog = document.getElementById('goal-dialog');
        this.goalForm = document.getElementById('goal-form');
        this.confirmDialog = document.getElementById('confirm-dialog');
        this.statusDialog = document.getElementById('status-dialog');
        this.initEvents();
    }
    initEvents() {
        this.createBtn?.addEventListener('click', () => {
            this.openGoalDialog(null, this.currentParentId);
        });
        this.goalForm?.addEventListener('submit', (e) => e.preventDefault());
        this.goalDialog?.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON' && target.value === 'save') {
                e.preventDefault();
                if (!this.goalForm?.checkValidity()) {
                    this.goalForm?.reportValidity();
                    return;
                }
                await this.handleSave();
            }
            else if (target.tagName === 'BUTTON' && target.value === 'cancel') {
                this.goalDialog?.close();
            }
        });
        this.confirmDialog?.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON' && target.value === 'confirm') {
                e.preventDefault();
                await this.handleDelete();
            }
            else if (target.tagName === 'BUTTON' && target.value === 'cancel') {
                this.confirmDialog?.close();
            }
        });
        this.statusDialog?.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON' && target.classList.contains('btn-status')) {
                e.preventDefault();
                await this.handleStatusChange(target.value);
            }
            else if (target.tagName === 'BUTTON' && target.value === 'cancel') {
                this.statusDialog?.close();
            }
        });
        // Event Delegation from Web Components
        document.addEventListener('navigate', (e) => {
            const detail = e.detail;
            this.navigateTo(detail.id);
        });
        document.addEventListener('nav-back', () => {
            this.navigateUp();
        });
        document.addEventListener('edit-goal', (e) => {
            const detail = e.detail;
            this.openGoalDialog(detail.goal);
        });
        document.addEventListener('delete-goal', (e) => {
            const detail = e.detail;
            this.openConfirmDelete(detail.id);
        });
        document.addEventListener('change-status', (e) => {
            const detail = e.detail;
            this.openStatusDialog(detail.goal);
        });
    }
    openGoalDialog(goal = null, parentId = null) {
        if (!this.goalForm || !this.goalDialog)
            return;
        this.goalForm.reset();
        const idInput = document.getElementById('goal-id');
        const parentIdInput = document.getElementById('goal-parent-id');
        const titleInput = document.getElementById('goal-title-input');
        const statusInput = document.getElementById('goal-status-input');
        const descInput = document.getElementById('goal-desc-input');
        const dialogTitle = document.getElementById('dialog-title');
        if (goal) {
            if (dialogTitle)
                dialogTitle.textContent = 'Edit Goal';
            idInput.value = goal.id;
            titleInput.value = goal.title;
            statusInput.value = goal.status;
            descInput.value = goal.description || '';
            parentIdInput.value = '';
        }
        else {
            if (dialogTitle)
                dialogTitle.textContent = 'New Goal';
            idInput.value = '';
            statusInput.value = 'ACTIVE';
            parentIdInput.value = parentId || '';
        }
        this.goalDialog.showModal();
    }
    async handleSave() {
        const formData = new FormData(this.goalForm);
        const id = formData.get('id');
        const parent_id = formData.get('parent_id');
        const title = formData.get('title');
        const status = formData.get('status');
        const description = formData.get('description');
        const payload = { title, description, status };
        if (parent_id)
            payload.parent_id = parent_id;
        try {
            this.showLoading();
            if (id) {
                await GoalService.updateGoal(id, payload);
            }
            else {
                await GoalService.createGoal(payload);
            }
            this.goalDialog?.close();
            await this.refreshGoals();
        }
        catch (e) {
            console.error(e);
            this.showError('Failed to save goal.');
        }
        finally {
            this.hideLoading();
        }
    }
    openConfirmDelete(id) {
        this.pendingDeleteId = id;
        this.confirmDialog?.showModal();
    }
    async handleDelete() {
        if (!this.pendingDeleteId)
            return;
        try {
            this.showLoading();
            await GoalService.deleteGoal(this.pendingDeleteId);
            this.confirmDialog?.close();
            this.pendingDeleteId = null;
            await this.refreshGoals();
        }
        catch (e) {
            console.error(e);
            this.showError('Failed to delete goal.');
        }
        finally {
            this.hideLoading();
        }
    }
    async refreshGoals() {
        try {
            this.hideError();
            this.showLoading();
            this.allGoals = await GoalService.fetchGoals();
            this.renderCurrentView();
        }
        catch (e) {
            this.showError('Failed to refresh goals.');
        }
        finally {
            this.hideLoading();
        }
    }
    // Public API for main.ts
    renderGoals(goals) {
        this.allGoals = goals;
        this.renderCurrentView();
    }
    renderCurrentView() {
        // Find current context
        let currentGoal;
        let goalsToShow = this.allGoals;
        if (this.currentParentId) {
            currentGoal = this.findGoal(this.allGoals, this.currentParentId);
            if (currentGoal) {
                goalsToShow = currentGoal.sub_goals || [];
            }
            else {
                // Parent deleted or lost
                this.currentParentId = null;
                goalsToShow = this.allGoals;
            }
        }
        // Update Components
        if (this.goalHeader) {
            this.goalHeader.goal = currentGoal || null;
        }
        if (this.goalList) {
            this.goalList.goals = goalsToShow;
        }
    }
    findGoal(nodes, id) {
        for (const node of nodes) {
            if (node.id === id)
                return node;
            if (node.sub_goals) {
                const found = this.findGoal(node.sub_goals, id);
                if (found)
                    return found;
            }
        }
        return undefined;
    }
    findParentNode(nodes, targetId) {
        for (const node of nodes) {
            if (node.sub_goals?.some(child => child.id === targetId)) {
                return node;
            }
            if (node.sub_goals) {
                const found = this.findParentNode(node.sub_goals, targetId);
                if (found)
                    return found;
            }
        }
        return null;
    }
    navigateTo(id) {
        this.currentParentId = id;
        document.documentElement.classList.remove('back-transition');
        this.updateViewWithTransition();
    }
    navigateUp() {
        if (!this.currentParentId)
            return;
        const parent = this.findParentNode(this.allGoals, this.currentParentId);
        this.currentParentId = parent ? parent.id : null;
        document.documentElement.classList.add('back-transition');
        this.updateViewWithTransition();
    }
    updateViewWithTransition() {
        if (document.startViewTransition) {
            document.startViewTransition(() => this.renderCurrentView());
        }
        else {
            this.renderCurrentView();
        }
    }
    openStatusDialog(goal) {
        this.activeGoalForStatus = goal;
        this.statusDialog?.showModal();
    }
    async handleStatusChange(newStatus) {
        if (!this.activeGoalForStatus)
            return;
        try {
            this.showLoading();
            const goal = this.activeGoalForStatus;
            await GoalService.updateGoal(goal.id, {
                status: newStatus
            });
            this.statusDialog?.close();
            this.activeGoalForStatus = null;
            await this.refreshGoals();
        }
        catch (e) {
            this.showError('Failed to update status');
        }
        finally {
            this.hideLoading();
        }
    }
    showError(msg) {
        if (this.errorMessage) {
            this.errorMessage.textContent = msg;
            this.errorMessage.classList.remove('hidden');
        }
    }
    hideError() {
        if (this.errorMessage)
            this.errorMessage.classList.add('hidden');
    }
    showLoading() {
        this.loadingIndicator?.classList.remove('hidden');
    }
    hideLoading() {
        this.loadingIndicator?.classList.add('hidden');
    }
}
