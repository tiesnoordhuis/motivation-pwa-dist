import { GoalService } from '../services/goal.service.js';
import { GoalNavigator } from './goal-navigator.js';
import { GoalDialogController } from './goal-dialog.controller.js';
export class GoalRenderer {
    navigator;
    dialogController;
    loadingIndicator;
    errorMessage;
    createBtn;
    constructor() {
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.errorMessage = document.getElementById('error-message');
        this.createBtn = document.getElementById('create-goal-btn');
        this.navigator = new GoalNavigator();
        this.dialogController = new GoalDialogController(() => this.refreshGoals());
        this.initEvents();
    }
    initEvents() {
        this.createBtn?.addEventListener('click', () => {
            this.dialogController.openGoalDialog(null, this.navigator.currentParentId);
        });
        // Event Delegation from Web Components
        document.addEventListener('navigate', (e) => {
            const detail = e.detail;
            this.navigator.navigateTo(detail.id);
        });
        document.addEventListener('nav-back', () => {
            this.navigator.navigateUp();
        });
        document.addEventListener('edit-goal', (e) => {
            const detail = e.detail;
            const goal = this.navigator.findGoal(this.navigator.allGoals, detail.id);
            if (goal)
                this.dialogController.openGoalDialog(goal);
        });
        document.addEventListener('delete-goal', (e) => {
            const detail = e.detail;
            this.dialogController.openConfirmDelete(detail.id);
        });
        document.addEventListener('change-status', (e) => {
            const detail = e.detail;
            const goal = this.navigator.findGoal(this.navigator.allGoals, detail.id);
            if (goal)
                this.dialogController.openStatusDialog(goal);
        });
    }
    async refreshGoals() {
        try {
            this.hideError();
            this.showLoading();
            const goals = await GoalService.fetchGoals();
            this.navigator.renderGoals(goals);
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
        this.navigator.renderGoals(goals);
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
