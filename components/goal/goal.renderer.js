import { GoalService } from '../../services/goal.service.js';
import { GoalNavigator } from './goal-navigator/goal-navigator.js';
import { GoalDialogController } from './goal-dialog/goal-dialog.controller.js';
export class GoalRenderer {
    navigator;
    dialogController;
    loadingIndicator;
    errorMessage;
    createBtn;
    constructor() {
        const container = document.getElementById('goals-view');
        const header = document.createElement('goal-header-card');
        header.id = 'goal-header';
        this.errorMessage = document.createElement('p');
        this.errorMessage.className = 'hidden';
        const goalList = document.createElement('goal-list');
        goalList.id = 'goals-list';
        this.createBtn = document.createElement('button');
        this.createBtn.className = 'fab';
        this.createBtn.title = 'New Goal';
        this.createBtn.textContent = '+';
        container.appendChild(header);
        container.appendChild(this.errorMessage);
        container.appendChild(goalList);
        container.appendChild(this.createBtn);
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.navigator = new GoalNavigator(goalList, header);
        this.dialogController = new GoalDialogController(() => this.refreshGoals());
        this.initEvents();
    }
    initEvents() {
        this.createBtn.addEventListener('click', () => {
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
    renderGoals(goals) {
        this.navigator.renderGoals(goals);
    }
    showError(msg) {
        this.errorMessage.textContent = msg;
        this.errorMessage.classList.remove('hidden');
    }
    hideError() {
        this.errorMessage.classList.add('hidden');
    }
    showLoading() {
        this.loadingIndicator?.classList.remove('hidden');
    }
    hideLoading() {
        this.loadingIndicator?.classList.add('hidden');
    }
}
