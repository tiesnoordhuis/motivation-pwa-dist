import { GoalService } from '../../services/goal.service.js';
import { GoalNavigator } from './goal-navigator/goal-navigator.js';
import { GoalDialogController } from './goal-dialog/goal-dialog.controller.js';
export class GoalRenderer {
    container;
    navigator;
    dialogController;
    loadingIndicator;
    errorMessage;
    createBtn;
    constructor(container) {
        this.container = container;
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
        this.container.appendChild(header);
        this.container.appendChild(this.errorMessage);
        this.container.appendChild(goalList);
        this.container.appendChild(this.createBtn);
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
        this.container.addEventListener('navigate', (e) => {
            const detail = e.detail;
            this.navigator.navigateTo(detail.id);
        });
        this.container.addEventListener('nav-back', () => {
            this.navigator.navigateUp();
        });
        this.container.addEventListener('edit-goal', (e) => {
            const detail = e.detail;
            const goal = this.navigator.findGoal(this.navigator.allGoals, detail.id);
            if (goal)
                this.dialogController.openGoalDialog(goal);
        });
        this.container.addEventListener('delete-goal', (e) => {
            const detail = e.detail;
            this.dialogController.openConfirmDelete(detail.id);
        });
        this.container.addEventListener('change-status', (e) => {
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
