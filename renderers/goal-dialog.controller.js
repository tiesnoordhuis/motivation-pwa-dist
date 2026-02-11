import { GoalService } from '../services/goal.service.js';
export class GoalDialogController {
    goalDialog;
    goalForm;
    confirmDialog;
    statusDialog;
    activeGoalForStatus = null;
    pendingDeleteId = null;
    onGoalChanged;
    constructor(onGoalChanged) {
        this.goalDialog = document.getElementById('goal-dialog');
        this.goalForm = document.getElementById('goal-form');
        this.confirmDialog = document.getElementById('confirm-dialog');
        this.statusDialog = document.getElementById('status-dialog');
        this.onGoalChanged = onGoalChanged;
        this.initEvents();
    }
    initEvents() {
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
            descInput.value = goal.description ?? '';
            parentIdInput.value = '';
        }
        else {
            if (dialogTitle)
                dialogTitle.textContent = 'New Goal';
            idInput.value = '';
            statusInput.value = 'ACTIVE';
            parentIdInput.value = parentId ?? '';
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
        const payload = { title, description, status: status };
        if (parent_id)
            payload.parent_id = parent_id;
        if (id) {
            await GoalService.updateGoal(id, payload);
        }
        else {
            await GoalService.createGoal(payload);
        }
        this.goalDialog?.close();
        await this.onGoalChanged();
    }
    openConfirmDelete(id) {
        this.pendingDeleteId = id;
        this.confirmDialog?.showModal();
    }
    async handleDelete() {
        if (!this.pendingDeleteId)
            return;
        await GoalService.deleteGoal(this.pendingDeleteId);
        this.confirmDialog?.close();
        this.pendingDeleteId = null;
        await this.onGoalChanged();
    }
    openStatusDialog(goal) {
        this.activeGoalForStatus = goal;
        this.statusDialog?.showModal();
    }
    async handleStatusChange(newStatus) {
        if (!this.activeGoalForStatus)
            return;
        const goal = this.activeGoalForStatus;
        await GoalService.updateGoal(goal.id, {
            status: newStatus
        });
        this.statusDialog?.close();
        this.activeGoalForStatus = null;
        await this.onGoalChanged();
    }
}
